"use client";

import React from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import Link from 'next/link';

export default function MeetingsCard() {
  const { upcomingMeetings, setUpcomingMeetings } = useDashboardStore();

  React.useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const apiHost = process.env.NEXT_PUBLIC_WS_URL 
          ? process.env.NEXT_PUBLIC_WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')
          : `${protocol}//${window.location.hostname}:8000`;
          
        const res = await fetch(`${apiHost}/api/meetings/upcoming`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUpcomingMeetings(data);
        }
      } catch (err) {
        console.error("Failed to fetch upcoming meetings", err);
      }
    };
    fetchUpcoming();
  }, [setUpcomingMeetings]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Meetings</h3>
        <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
          Visit Meetings
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {upcomingMeetings.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-4 px-4 text-center border border-gray-100">
            <p className="text-sm font-semibold text-gray-900">No Upcoming Meetings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-colors bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{meeting.title}</p>
                  <p className="text-xs text-gray-500">ID: {meeting.id} • Passcode: {meeting.passcode || 'None'}</p>
                  <p className="text-xs text-gray-400 mt-1">{meeting.date} at {meeting.time}</p>
                </div>
                <button 
                  onClick={() => window.location.href = `/launch?meetingId=${meeting.id}`}
                  className="bg-blue-600 text-white px-3 py-1 text-xs rounded-full font-medium hover:bg-blue-700"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-center">
        <button className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors">
          Test Audio and Video
        </button>
      </div>
    </div>
  );
}
