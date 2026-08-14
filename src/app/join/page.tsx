"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/Layout/TopNav';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store/useDashboardStore';

export default function JoinPage() {
  const [meetingId, setMeetingId] = useState('');
  const [passcode, setPasscode] = useState('');
  const { user, setSession } = useDashboardStore();
  const [displayName, setDisplayName] = useState(user.name || '');
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedMeetingId = meetingId.trim();
    const trimmedName = displayName.trim();

    if (!trimmedMeetingId || !trimmedName) return;

    setIsValidating(true);
    try {
      const { joinMeeting } = await import('@/lib/api');
      const data = await joinMeeting(trimmedMeetingId, passcode.trim(), trimmedName, user.userId);
      setSession(data.name, data.user_id);

      const query = new URLSearchParams({
        meetingId: trimmedMeetingId,
        name: data.name
      });

      if (passcode.trim()) {
        query.set('pwd', passcode.trim());
      }

      router.push(`/meeting?${query.toString()}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to join meeting';
      alert(message);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-8">Join Meeting</h1>
        
        <form onSubmit={handleJoin} className="w-full max-w-sm text-left">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />

          <label className="block text-xs font-medium text-gray-700 mb-1">
            Meeting ID or Personal Link Name
          </label>
          <input 
            type="text" 
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Enter Meeting ID or Personal Link Name" 
            className="w-full rounded border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />

          <label className="mt-3 block text-xs font-medium text-gray-700 mb-1">
            Passcode
          </label>
          <input
            type="text"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode if required"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          <label className="mt-3 flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Always join from browser
          </label>
          
          <button 
            type="submit"
            disabled={!meetingId.trim() || !displayName.trim() || isValidating}
            className={cn(
              "mt-4 w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              meetingId.trim() && displayName.trim() && !isValidating
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isValidating && (
              <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {isValidating ? "Validating..." : "Join"}
          </button>
        </form>
        
        <div className="mt-12 text-xs">
          <a href="#" className="text-blue-600 hover:underline">Join a meeting from an H.323/SIP room system</a>
        </div>
      </main>
    </div>
  );
}
