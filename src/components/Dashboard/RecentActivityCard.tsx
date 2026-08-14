"use client";

import React from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';

export default function RecentActivityCard() {
  const { recentMeetings, setRecentMeetings } = useDashboardStore();

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const apiHost = process.env.NEXT_PUBLIC_WS_URL 
          ? process.env.NEXT_PUBLIC_WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')
          : `${protocol}//${window.location.hostname}:8000`;
          
        const res = await fetch(`${apiHost}/api/meetings/history`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setRecentMeetings(data);
        }
      } catch (err) {
        console.error("Failed to fetch meeting history", err);
      }
    };
    fetchHistory();
  }, [setRecentMeetings]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col min-h-[200px]">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent activity</h3>
      
      <div className="flex-1">
        {recentMeetings.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-start gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 font-semibold">{meeting.title.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{meeting.title}</p>
                  <p className="text-xs text-gray-500">{meeting.date} at {meeting.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
