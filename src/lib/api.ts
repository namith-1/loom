const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const apiHost = process.env.NEXT_PUBLIC_WS_URL 
      ? process.env.NEXT_PUBLIC_WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')
      : `${protocol}//${window.location.hostname}:8000`;
    return `${apiHost}/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

export type MeetingValidation = {
  meeting_id: string;
  requires_pwd: boolean;
};

export type JoinMeetingResponse = {
  status: string;
  user_id: string;
  name: string;
  requires_pwd: boolean;
};

export async function createMeeting(title: string = 'New Meeting', secure: boolean = true, userId?: string, name?: string) {
  const res = await fetch(`${getApiUrl()}/meetings/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, secure_with_pwd: secure, user_id: userId, name }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to create meeting');
  return res.json();
}

export async function validateJoin(meetingId: string): Promise<MeetingValidation> {
  const res = await fetch(`${getApiUrl()}/meetings/${encodeURIComponent(meetingId)}/validate`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Invalid meeting ID');
  return res.json();
}

export async function joinMeeting(meetingId: string, passcode: string, name: string, userId?: string): Promise<JoinMeetingResponse> {
  const res = await fetch(`${getApiUrl()}/meetings/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      meeting_id: meetingId,
      passcode: passcode || null,
      name: name.trim() || null,
      user_id: userId
    }),
    credentials: 'include'
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || 'Failed to join meeting');
  }

  return res.json();
}
