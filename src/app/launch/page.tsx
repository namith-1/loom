"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/components/Layout/TopNav';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store/useDashboardStore';
import { joinMeeting } from '@/lib/api';

function LaunchContent() {
  const [isJoining, setIsJoining] = useState(false);
  const { user, setSession } = useDashboardStore();
  const [guestName, setGuestName] = useState(user.name || '');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meetingId') || '';
  const urlPwd = searchParams.get('pwd') || '';
  const [localPwd, setLocalPwd] = useState(urlPwd);

  const autoJoin = searchParams.get('autoJoin') === 'true';
  const hasAutoJoined = React.useRef(false);

  const handleJoinBrowser = async () => {
    setIsJoining(true);
    const trimmedName = guestName.trim();
    try {
      const data = await joinMeeting(meetingId, localPwd, trimmedName, user.userId);
      setSession(data.name, data.user_id);
      setTimeout(() => {
        const query = new URLSearchParams({
          meetingId,
          name: data.name
        });

        if (localPwd) {
          query.set('pwd', localPwd);
        }

        router.push(`/meeting?${query.toString()}`);
      }, 1000);
    } catch (err) {
      console.error("Join failed", err);
      const message = err instanceof Error ? err.message : 'Failed to join';
      alert(`Failed to join: ${message}`);
      setIsJoining(false);
    }
  };

  React.useEffect(() => {
    // Attempt auto-join if explicitly requested OR if we have a meetingId and are already logged in
    const shouldAutoJoin = autoJoin || (meetingId && guestName.trim() && user?.name);
    
    if (shouldAutoJoin && guestName.trim() && !hasAutoJoined.current) {
      hasAutoJoined.current = true;
      handleJoinBrowser();
    }
  }, [autoJoin, meetingId, guestName, user]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {isJoining ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
            <h1 className="text-xl font-bold text-gray-900">Joining meeting...</h1>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-8">Join meeting</h1>
            
            <div className="w-full max-w-sm space-y-4">
              {!user?.name && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 text-left mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {!urlPwd && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 text-left mb-1">Passcode</label>
                  <input 
                    type="text" 
                    value={localPwd}
                    onChange={(e) => setLocalPwd(e.target.value)}
                    placeholder="Enter meeting passcode (if required)"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Join from Zoom Workplace app
              </button>
              
              <button 
                onClick={handleJoinBrowser}
                disabled={!guestName.trim()}
                className={cn(
                  "w-full block rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  guestName.trim() ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50" : "bg-gray-100 text-gray-400 cursor-not-allowed border-transparent"
                )}
              >
                Join from browser
              </button>
            </div>
            
            <p className="mt-6 text-xs text-gray-600">
              Don&apos;t have the Zoom Workplace app installed? <a href="#" className="text-blue-600 hover:underline">Download Now</a>
            </p>
            
            <div className="mt-8 text-xs text-gray-500 max-w-md">
              By joining a meeting, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Statement</a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function LaunchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LaunchContent />
    </Suspense>
  );
}
