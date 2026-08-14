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

## How to Use the Application

### 1. Initial Access
- Upon visiting the application, you will be prompted to enter a **Display Name**. This seamlessly logs you in without requiring a password.
- You will then be redirected to the **Zoom Dashboard**.

### 2. Creating an Instant Meeting
- Click the large orange **"New Meeting"** button on the dashboard.
- A secure Meeting ID and Passcode will be instantly generated.
- You will bypass the waiting room (as you are the Host) and join the WebRTC call immediately.
- To invite others, click the **"i" (Info) icon** in the top left corner of the meeting and copy the Invite Link.

### 3. Joining a Meeting (as a Guest)
- **Via Link:** Simply click an invite link (e.g. `/launch?meetingId=123&pwd=abc`). You will be prompted for your name and automatically joined.
- **Via Dashboard:** Click the blue **"Join"** button on the dashboard, enter the Meeting ID provided by the host, and if the meeting requires a passcode, you will be securely prompted for it.

### 4. Scheduling a Meeting
- Click the **"Schedule"** button on the dashboard.
- Fill out the Topic, Date, and Time.
- Click **Save**. The meeting will now appear dynamically in your **Upcoming Meetings** list on the right side of the dashboard.

### 5. Host Controls & Session Management
- **End Meeting for All:** As a host, click **"End"** in the bottom right corner of the meeting, then select **"End Meeting for All"**. This terminates the WebSocket and kicks all participants back to the home page.
- **Reclaiming Host:** If you accidentally close your tab or leave the meeting, the system will temporarily assign a random guest as the host. When you (the original creator) rejoin the meeting, a blue **"Reclaim Host"** button will appear at the top of your screen to take back your privileges.
- **Return to Meeting:** If you navigate back to the dashboard while you are still active in a meeting, a **"Meeting in Progress"** banner will appear on your dashboard, allowing you to seamlessly auto-rejoin.

## Features Implemented
- ✅ **Landing Dashboard:** Exact replica of Zoom's modern UI, featuring quick actions, upcoming meetings, and a responsive sidebar.
- ✅ **Instant Meeting Creation:** Instantly spins up a unique meeting ID, bypasses passcode requirements for the host, and drops them directly into a waiting room/meeting.
- ✅ **Join Meeting:** Guests can join via a shareable invite link or by manually typing the ID and passcode into the dashboard.
- ✅ **Schedule Meetings:** Fully functional scheduling form that generates a meeting, saves it to SQLite, and renders it dynamically on the Upcoming Meetings dashboard.
- ✅ **Video / Audio Controls:** WebRTC streams with functioning Mute Audio / Stop Video controls.
- ✅ **Real-Time Chat:** Integrated WebSocket chat system allowing participants to send messages to the room in real-time.
- ✅ **Cross-Origin Deployment:** Configured CORS and SameSite=none cookies to allow the Next.js frontend (Vercel) to securely communicate with the FastAPI backend (Render) across different domains.
- ✅ **Mobile Responsiveness:** Custom `100dvh` flex layouts and absolute positioning allow the application to perfectly mimic the native Zoom mobile app experience on Safari and Chrome mobile browsers.
