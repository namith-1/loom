from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Response, Request, Cookie, status, BackgroundTasks
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Optional
import asyncio
import json
import uuid
import sqlite3
from datetime import datetime
import contextlib

DB_FILE = "database.db"

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS meetings (
                meeting_id TEXT PRIMARY KEY,
                host_id TEXT,
                title TEXT,
                passcode TEXT,
                status TEXT,
                scheduled_time TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (host_id) REFERENCES users(user_id)
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS meeting_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                meeting_id TEXT,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id)
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT,
                name TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        conn.commit()

init_db()

@contextlib.contextmanager
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"422 Error! Body: {await request.body()}")
    print(f"Details: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

class SessionData(BaseModel):
    session_id: str
    user_id: str
    name: str
    current_meeting: Optional[str] = None

user_sessions: Dict[str, SessionData] = {}

def get_session_data(session_id: str) -> Optional[SessionData]:
    if not session_id:
        return None
    if session_id in user_sessions:
        return user_sessions[session_id]
    with get_db() as db:
        row = db.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,)).fetchone()
        if row:
            session_data = SessionData(
                session_id=row['session_id'],
                user_id=row['user_id'],
                name=row['name']
            )
            user_sessions[session_id] = session_data
            return session_data
    return None

import os

app = FastAPI()

# Add FRONTEND_URL from environment variables if it exists
frontend_url = os.getenv("FRONTEND_URL")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if frontend_url:
    # Strip trailing slash to match browser Origin headers
    frontend_url = frontend_url.rstrip("/")
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AttendeeState(BaseModel):
    attendee_id: str
    user_id: Optional[str] = None
    display_name: str
    is_host: bool = False
    camera_on: bool = False
    audio_on: bool = False
    screen_sharing: bool = False
    peer_id: Optional[str] = None

class MeetingRoom(BaseModel):
    meeting_id: str
    passcode: Optional[str] = None
    host_id: Optional[str] = None
    original_host_id: Optional[str] = None
    attendees: Dict[str, AttendeeState] = Field(default_factory=dict)

active_sessions: Dict[str, MeetingRoom] = {}
room_lock = asyncio.Lock()

class ConnectionManager:
    def __init__(self):
        # meeting_id -> attendee_id -> WebSocket
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, meeting_id: str, attendee_id: str, websocket: WebSocket):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = {}
        self.active_connections[meeting_id][attendee_id] = websocket

    async def disconnect(self, meeting_id: str, attendee_id: str):
        if meeting_id in self.active_connections:
            self.active_connections[meeting_id].pop(attendee_id, None)

    async def broadcast(self, meeting_id: str, message: dict):
        if meeting_id in self.active_connections:
            payload = json.dumps(message)
            for ws in self.active_connections[meeting_id].values():
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

    async def send_personal(self, meeting_id: str, attendee_id: str, message: dict):
        if meeting_id in self.active_connections and attendee_id in self.active_connections[meeting_id]:
            try:
                await self.active_connections[meeting_id][attendee_id].send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

class CreateMeetingRequest(BaseModel):
    title: str
    secure_with_pwd: bool = True
    user_id: Optional[str] = None
    name: Optional[str] = None

@app.post("/api/meetings/create")
async def create_meeting(data: CreateMeetingRequest, request: Request, background_tasks: BackgroundTasks):
    session_id = request.cookies.get("session_id")
    session_data = get_session_data(session_id)
    
    if session_data:
        host_user_id = session_data.user_id
    elif data.user_id and data.name:
        host_user_id = data.user_id
        def ensure_user():
            with get_db() as db:
                row = db.execute("SELECT user_id FROM users WHERE user_id = ?", (host_user_id,)).fetchone()
                if not row:
                    db.execute("INSERT INTO users (user_id, name) VALUES (?, ?)", (host_user_id, data.name))
                    db.commit()
        background_tasks.add_task(ensure_user)
    else:
        raise HTTPException(status_code=401, detail="Must be logged in to create a meeting")
        
    async with room_lock:
        meeting_id = str(uuid.uuid4())[:8]
        passcode = str(uuid.uuid4())[:6] if data.secure_with_pwd else None
        
        active_sessions[meeting_id] = MeetingRoom(
            meeting_id=meeting_id,
            passcode=passcode,
            host_id=host_user_id,
            original_host_id=host_user_id
        )
        
        def save_meeting():
            with get_db() as db:
                db.execute("INSERT INTO meetings (meeting_id, host_id, title, passcode, status) VALUES (?, ?, ?, ?, ?)", 
                          (meeting_id, host_user_id, data.title, passcode, 'active'))
                db.execute("INSERT INTO meeting_history (user_id, meeting_id, joined_at) VALUES (?, ?, ?)", 
                          (host_user_id, meeting_id, datetime.utcnow().isoformat()))
                db.commit()
        background_tasks.add_task(save_meeting)

        invite_link = f"/launch?meetingId={meeting_id}" + (f"&pwd={passcode}" if passcode else "")
        return {
            "meeting_id": meeting_id,
            "invite_link": invite_link,
            "passcode": passcode
        }

@app.get("/api/meetings/{meeting_id}/validate")
async def validate_meeting(meeting_id: str):
    async with room_lock:
        if meeting_id not in active_sessions:
            raise HTTPException(status_code=404, detail="Meeting does not exist")

        room = active_sessions[meeting_id]
        return {
            "meeting_id": meeting_id,
            "requires_pwd": bool(room.passcode)
        }

class JoinMeetingRequest(BaseModel):
    meeting_id: str
    passcode: Optional[str] = None
    name: Optional[str] = None
    user_id: Optional[str] = None

@app.post("/api/meetings/join")
async def join_meeting(data: JoinMeetingRequest, response: Response, request: Request, background_tasks: BackgroundTasks):
    async with room_lock:
        if data.meeting_id not in active_sessions:
            with get_db() as db:
                row = db.execute("SELECT * FROM meetings WHERE meeting_id = ?", (data.meeting_id,)).fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Meeting does not exist")
            active_sessions[data.meeting_id] = MeetingRoom(
                meeting_id=data.meeting_id,
                passcode=row['passcode'],
                host_id=row['host_id'],
                original_host_id=row['host_id']
            )
        
        room = active_sessions[data.meeting_id]
        
        session_id = request.cookies.get("session_id")
        session_data = get_session_data(session_id)
        current_user_id = session_data.user_id if session_data else None

        print(f"DEBUG: Join Attempt - Meeting: {data.meeting_id}")
        print(f"DEBUG: Session ID: {session_id}, found data? {bool(session_data)}")
        print(f"DEBUG: Current User ID: {current_user_id}")
        print(f"DEBUG: Room Host ID: {room.host_id}")
        print(f"DEBUG: Room Passcode: '{room.passcode}', Provided Passcode: '{data.passcode}'")

        if room.passcode and room.passcode != data.passcode:
            if not current_user_id or current_user_id != room.host_id:
                print("DEBUG: Failing with 401 Invalid meeting passcode")
                raise HTTPException(status_code=401, detail="Invalid meeting passcode")
            else:
                print("DEBUG: Bypassing passcode for host!")
            
        if not session_data:
            if not data.name:
                raise HTTPException(status_code=400, detail="Name is required for guest join")
            
            user_id = data.user_id
            if not user_id:
                with get_db() as db:
                    row = db.execute("SELECT user_id FROM users WHERE name = ?", (data.name,)).fetchone()
                    if row:
                        user_id = row['user_id']
                    else:
                        user_id = f"user-id-{str(uuid.uuid4())[:8]}"
                        db.execute("INSERT INTO users (user_id, name) VALUES (?, ?)", (user_id, data.name))
                        db.commit()
            else:
                with get_db() as db:
                    row = db.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,)).fetchone()
                    if not row:
                        db.execute("INSERT INTO users (user_id, name) VALUES (?, ?)", (user_id, data.name))
                        db.commit()

            session_id = str(uuid.uuid4())
            session_data = SessionData(
                session_id=session_id,
                user_id=user_id,
                name=data.name
            )
            user_sessions[session_id] = session_data
            response.set_cookie(key="session_id", value=session_id, httponly=True, samesite="none", secure=True, max_age=60 * 60 * 24 * 30)
            
            def save_guest():
                with get_db() as db:
                    db.execute("INSERT OR REPLACE INTO sessions (session_id, user_id, name) VALUES (?, ?, ?)", (session_id, user_id, data.name))
                    db.commit()
            background_tasks.add_task(save_guest)
        elif data.name and data.name.strip():
            session_data.name = data.name.strip()
            
        session_data.current_meeting = data.meeting_id
        current_user_id = session_data.user_id
        
        def save_history():
            with get_db() as db:
                db.execute("INSERT INTO meeting_history (user_id, meeting_id, joined_at) VALUES (?, ?, ?)", 
                          (current_user_id, data.meeting_id, datetime.utcnow().isoformat()))
                db.commit()
        background_tasks.add_task(save_history)
            
        return {"status": "success", "user_id": current_user_id, "name": session_data.name, "requires_pwd": bool(room.passcode)}

@app.post("/api/meetings/leave")
async def leave_meeting(session_id: Optional[str] = Cookie(None)):
    if session_id and session_id in user_sessions:
        user_sessions[session_id].current_meeting = None
    return {"status": "success"}

class LoginRequest(BaseModel):
    name: str

@app.post("/api/auth/login")
async def login(data: LoginRequest, response: Response, background_tasks: BackgroundTasks):
    with get_db() as db:
        row = db.execute("SELECT user_id FROM users WHERE name = ?", (data.name,)).fetchone()
        if row:
            user_id = row['user_id']
        else:
            user_id = f"user-id-{str(uuid.uuid4())[:8]}"
            db.execute("INSERT INTO users (user_id, name) VALUES (?, ?)", (user_id, data.name))
            db.commit()

    session_id = str(uuid.uuid4())
    user_sessions[session_id] = SessionData(
        session_id=session_id,
        user_id=user_id,
        name=data.name
    )
    
    def save_session():
        with get_db() as db:
            db.execute("INSERT OR REPLACE INTO sessions (session_id, user_id, name) VALUES (?, ?, ?)", (session_id, user_id, data.name))
            db.commit()
    background_tasks.add_task(save_session)
    
    response.set_cookie(key="session_id", value=session_id, httponly=True, samesite="none", secure=True, max_age=60 * 60 * 24 * 30)
    return {"status": "success", "user_id": user_id, "name": data.name}

@app.get("/api/auth/me")
async def get_me(session_id: Optional[str] = Cookie(None)):
    session_data = get_session_data(session_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session_data

@app.get("/api/auth/session")
async def get_session(session_id: Optional[str] = Cookie(None)):
    session_data = get_session_data(session_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session_data


class ScheduleMeetingRequest(BaseModel):
    title: str
    date: str
    time: str
    secure_with_pwd: bool = True
    user_id: Optional[str] = None
    name: Optional[str] = None

@app.post("/api/meetings/schedule")
async def schedule_meeting(data: ScheduleMeetingRequest, request: Request, background_tasks: BackgroundTasks):
    session_id = request.cookies.get("session_id")
    session_data = get_session_data(session_id)
    
    if session_data:
        host_user_id = session_data.user_id
    elif data.user_id and data.name:
        host_user_id = data.user_id
        def ensure_user_sched():
            with get_db() as db:
                row = db.execute("SELECT user_id FROM users WHERE user_id = ?", (host_user_id,)).fetchone()
                if not row:
                    db.execute("INSERT INTO users (user_id, name) VALUES (?, ?)", (host_user_id, data.name))
                    db.commit()
        background_tasks.add_task(ensure_user_sched)
    else:
        raise HTTPException(status_code=401, detail="Must be logged in to schedule a meeting")
        
    meeting_id = str(uuid.uuid4())[:8]
    passcode = str(uuid.uuid4())[:6] if data.secure_with_pwd else None
    scheduled_datetime = f"{data.date} {data.time}"
    
    def save_scheduled():
        with get_db() as db:
            db.execute("INSERT INTO meetings (meeting_id, host_id, title, passcode, status, scheduled_time) VALUES (?, ?, ?, ?, ?, ?)", 
                      (meeting_id, host_user_id, data.title, passcode, 'scheduled', scheduled_datetime))
            db.commit()
    background_tasks.add_task(save_scheduled)

    return {
        "meeting_id": meeting_id,
        "passcode": passcode,
        "status": "success"
    }

@app.get("/api/meetings/upcoming")
async def get_upcoming(request: Request):
    session_id = request.cookies.get("session_id")
    session_data = get_session_data(session_id)
    if not session_data:
        return []
    user_id = session_data.user_id
    with get_db() as db:
        rows = db.execute("SELECT * FROM meetings WHERE host_id = ? AND status = 'scheduled' ORDER BY scheduled_time ASC", (user_id,)).fetchall()
        
    result = []
    for row in rows:
        dt = row['scheduled_time']
        parts = dt.split(' ', 1)
        date_str = parts[0] if len(parts) > 0 else ''
        time_str = parts[1] if len(parts) > 1 else ''
        result.append({
            "id": row['meeting_id'],
            "title": row['title'],
            "passcode": row['passcode'],
            "date": date_str,
            "time": time_str,
            "isUpcoming": True
        })
    return result

@app.get("/api/meetings/history")
async def get_history(request: Request):
    session_id = request.cookies.get("session_id")
    session_data = get_session_data(session_id)
    if not session_data:
        return []
    user_id = session_data.user_id
    with get_db() as db:
        rows = db.execute('''
            SELECT m.meeting_id, m.title, MAX(h.joined_at) as last_joined
            FROM meeting_history h
            JOIN meetings m ON h.meeting_id = m.meeting_id
            WHERE h.user_id = ?
            GROUP BY m.meeting_id
            ORDER BY last_joined DESC
            LIMIT 10
        ''', (user_id,)).fetchall()
        
    result = []
    for row in rows:
        joined_at = row['last_joined']
        try:
            dt = datetime.fromisoformat(joined_at)
            date_str = dt.strftime("%b %d, %Y")
            time_str = dt.strftime("%I:%M %p")
        except:
            date_str = joined_at
            time_str = ""
            
        result.append({
            "id": row['meeting_id'],
            "title": row['title'] or f"Meeting {row['meeting_id']}",
            "date": date_str,
            "time": time_str,
            "isUpcoming": False
        })
    return result

@app.websocket("/ws/meeting/{meeting_id}/{attendee_id}")
async def meeting_websocket(websocket: WebSocket, meeting_id: str, attendee_id: str):
    display_name = websocket.query_params.get("name", "Guest")
    user_id = websocket.query_params.get("user_id") or attendee_id

    async with room_lock:
        if meeting_id not in active_sessions:
            with get_db() as db:
                row = db.execute("SELECT * FROM meetings WHERE meeting_id = ?", (meeting_id,)).fetchone()
            if not row:
                await websocket.close(code=4004, reason="Meeting does not exist")
                return
            active_sessions[meeting_id] = MeetingRoom(
                meeting_id=meeting_id,
                passcode=row['passcode'],
                host_id=row['host_id'],
                original_host_id=row['host_id']
            )
        
        room = active_sessions[meeting_id]
        
        # Determine host status based on the stable backend user_id.
        is_host = False
        if room.host_id and user_id == room.host_id:
            is_host = True
        elif not room.host_id:
            room.host_id = user_id
            is_host = True
        
        room.attendees[attendee_id] = AttendeeState(
            attendee_id=attendee_id,
            user_id=user_id,
            display_name=display_name,
            is_host=is_host
        )

    await manager.connect(meeting_id, attendee_id, websocket)

    await manager.broadcast(meeting_id, {
        "event": "PARTICIPANT_JOINED",
        "original_host_id": active_sessions[meeting_id].original_host_id,
        "attendees": {k: v.dict() for k, v in active_sessions[meeting_id].attendees.items()}
    })

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            event_type = message.get("event")

            if event_type == "STATE_UPDATE":
                async with room_lock:
                    room = active_sessions.get(meeting_id)
                    if room:
                        sender = room.attendees.get(attendee_id)
                        if sender:
                            if "audio_on" in message: sender.audio_on = message["audio_on"]
                            if "camera_on" in message: sender.camera_on = message["camera_on"]
                            if "screen_sharing" in message: sender.screen_sharing = message["screen_sharing"]
                            
                await manager.broadcast(meeting_id, {
                    "event": "STATE_SYNC",
                    "original_host_id": room.original_host_id if room else None,
                    "attendees": {k: v.dict() for k, v in active_sessions[meeting_id].attendees.items()}
                })

            elif event_type == "USER_JOINED":
                async with room_lock:
                    room = active_sessions.get(meeting_id)
                    if room:
                        sender = room.attendees.get(attendee_id)
                        if sender:
                            sender.peer_id = message.get("peerId")
                            
                await manager.broadcast(meeting_id, {
                    "event": "USER_JOINED",
                    "attendee_id": attendee_id,
                    "peerId": message.get("peerId"),
                    "original_host_id": room.original_host_id if room else None,
                    "attendees": {k: v.dict() for k, v in active_sessions[meeting_id].attendees.items()}
                })

            elif event_type == "HOST_MUTE_ALL":
                async with room_lock:
                    room = active_sessions.get(meeting_id)
                    if room and room.attendees.get(attendee_id, {}).is_host:
                        for att in room.attendees.values():
                            if att.attendee_id != attendee_id:
                                att.audio_on = False
                await manager.broadcast(meeting_id, {
                    "event": "STATE_SYNC",
                    "original_host_id": room.original_host_id if room else None,
                    "attendees": {k: v.dict() for k, v in active_sessions[meeting_id].attendees.items()}
                })

            elif event_type == "RECLAIM_HOST":
                async with room_lock:
                    room = active_sessions.get(meeting_id)
                    if room and user_id == room.original_host_id:
                        room.host_id = user_id
                        for att in room.attendees.values():
                            att.is_host = (att.user_id == user_id)
                await manager.broadcast(meeting_id, {
                    "event": "STATE_SYNC",
                    "original_host_id": room.original_host_id if room else None,
                    "attendees": {k: v.dict() for k, v in active_sessions[meeting_id].attendees.items()}
                })

            elif event_type == "END_MEETING":
                async with room_lock:
                    room = active_sessions.get(meeting_id)
                    if room and room.attendees.get(attendee_id, {}).is_host:
                        await manager.broadcast(meeting_id, {
                            "event": "END_MEETING"
                        })
                        active_sessions.pop(meeting_id, None)
                        
            elif event_type == "KICK_PARTICIPANT":
                target_id = message.get("target_id")
                async with room_lock:
                    room = active_sessions.get(meeting_id)
                    if room and room.attendees.get(attendee_id, {}).is_host:
                        if target_id in room.attendees:
                            await manager.send_personal(meeting_id, target_id, {"event": "KICKED"})

    except WebSocketDisconnect:
        await manager.disconnect(meeting_id, attendee_id)
        async with room_lock:
            if meeting_id in active_sessions:
                room = active_sessions[meeting_id]
                room.attendees.pop(attendee_id, None)

                if room.host_id == user_id:
                    if room.attendees:
                        new_host_id = next(iter(room.attendees.keys()))
                        room.attendees[new_host_id].is_host = True
                        room.host_id = room.attendees[new_host_id].user_id
                    else:
                        active_sessions.pop(meeting_id, None)

        await manager.broadcast(meeting_id, {
            "event": "PARTICIPANT_LEFT",
            "original_host_id": active_sessions[meeting_id].original_host_id if meeting_id in active_sessions else None,
            "attendees": {k: v.dict() for k, v in active_sessions[meeting_id].attendees.items()} if meeting_id in active_sessions else {}
        })
