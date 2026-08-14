# Zoom Clone - Video Conferencing Platform

A full-stack, fully functional video conferencing web application designed to precisely replicate Zoom's core meeting workflows, user interface, and overall user experience.

## Technical Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React, Tailwind CSS, Zustand (State Management), PeerJS (WebRTC)
- **Backend:** Python, FastAPI, WebSockets, Uvicorn
- **Database:** SQLite (built-in, async-safe architecture)
- **Real-Time Communication:** PeerJS (WebRTC for mesh peer-to-peer video/audio routing), FastAPI WebSockets (for chat and signaling)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Start the Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Frontend (Next.js)
Open a new terminal at the root of the project:
```bash
npm install
npm run dev
```

### 3. Access the Application
Navigate to `http://localhost:3000` in your web browser.

## Assumptions & Design Decisions

### Authentication & Users
- **Assumption:** Since the assignment specified "No Login Required: Assume a default user is logged in", a lightweight pseudo-authentication system was implemented.
- **Implementation:** Users provide a Display Name to "log in". The backend automatically generates a unique UUID for them and issues a Secure, HTTP-Only `session_id` cookie. This allows the system to seamlessly distinguish between the "Host" (the person who created the meeting) and "Guests" without requiring passwords or complex OAuth setups.

### Database Architecture
- **Assumption:** SQLite is used as the primary database, but it requires careful handling in concurrent environments.
- **Implementation:** The database schema tracks `users`, `meetings`, and `sessions`. To maintain high performance during real-time video calls, active meetings and WebSocket connections are cached in high-speed RAM on the FastAPI server, while meeting metadata (scheduling, history) is lazily persisted to SQLite via non-blocking Background Tasks.

### Video Routing (WebRTC)
- **Assumption:** A mesh network topology is sufficient for the scope of this assignment. 
- **Implementation:** PeerJS is used to handle WebRTC connection brokering. Every participant establishes a direct peer-to-peer media stream with every other participant in the room. This avoids the complexity and high server costs of building an SFU (Selective Forwarding Unit) from scratch while still providing high-quality, low-latency video and audio.

### Host Controls & Passcodes
- **Assumption:** Passcodes are required to prevent unauthorized users from joining.
- **Implementation:** When a user schedules or instantly creates a meeting, a 6-character secure passcode is generated. The creator is recognized as the "Host" via their session cookie and bypasses the passcode check. Guests who attempt to join via a link or Meeting ID are halted at a waiting screen and forced to provide the passcode.

## Features Implemented
- ✅ **Landing Dashboard:** Exact replica of Zoom's modern UI, featuring quick actions, upcoming meetings, and a responsive sidebar.
- ✅ **Instant Meeting Creation:** Instantly spins up a unique meeting ID, bypasses passcode requirements for the host, and drops them directly into a waiting room/meeting.
- ✅ **Join Meeting:** Guests can join via a shareable invite link (`/launch?meetingId=...&pwd=...`) or by manually typing the ID and passcode into the dashboard.
- ✅ **Schedule Meetings:** Fully functional scheduling form that generates a meeting, saves it to SQLite, and renders it dynamically on the Upcoming Meetings dashboard.
- ✅ **Video / Audio Controls:** WebRTC streams with functioning Mute Audio / Stop Video controls.
- ✅ **Real-Time Chat:** Integrated WebSocket chat system allowing participants to send messages to the room in real-time.
- ✅ **Cross-Origin Deployment:** Configured CORS and SameSite=none cookies to allow the Next.js frontend (Vercel) to securely communicate with the FastAPI backend (Render) across different domains.
