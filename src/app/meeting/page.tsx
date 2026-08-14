"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMeetingStore } from '@/store/useMeetingStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { usePeerJS } from '@/hooks/usePeerJS';
import TopBar from '@/components/Meeting/TopBar';
import VideoGrid from '@/components/Meeting/VideoGrid';
import BottomControlBar from '@/components/Meeting/BottomControlBar';
import ParticipantPanel from '@/components/Meeting/ParticipantPanel';
import ChatPanel from '@/components/Meeting/ChatPanel';
import Popovers from '@/components/Meeting/Popovers';

function MeetingContent() {
  const { setActivePopover } = useMeetingStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('meetingId') || 'test-room';
  const { user, userId } = useDashboardStore();
  
  const urlName = searchParams.get('name');
  const pwd = searchParams.get('pwd');
  const canJoin = Boolean(urlName || user?.name);
  const displayName = urlName || user.name || 'Guest';
  const attendeeId = userId;

  usePeerJS(meetingId, attendeeId, displayName, canJoin);

  useEffect(() => {
    const launchUrl = pwd ? `/launch?meetingId=${meetingId}&pwd=${pwd}&autoJoin=true` : `/launch?meetingId=${meetingId}&autoJoin=true`;
    
    if (!user?.name) {
      // No session -> go to login page (/)
      router.push(`/?returnTo=${encodeURIComponent(launchUrl)}`);
    } else if (!urlName) {
      // Logged in but haven't gone through the launch flow -> go to launch
      router.push(launchUrl);
    }
  }, [urlName, meetingId, pwd, user, router]);

  // Close popovers on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePopover(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActivePopover]);

  if (!canJoin) {
    return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Redirecting...</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans select-none">
      
      {/* Absolute Overlays */}
      <TopBar />
      <Popovers />

      {/* Main Layout Area */}
      <div className="flex flex-1 w-full overflow-hidden pt-12" onClick={() => setActivePopover(null)}>
        
        {/* Video Grid Area */}
        <VideoGrid />

        {/* Right Sidebar */}
        <ParticipantPanel />
        <ChatPanel />

      </div>

      {/* Bottom Controls */}
      <BottomControlBar />
      
    </div>
  );
}

export default function MeetingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center text-white">Connecting to meeting...</div>}>
      <MeetingContent />
    </Suspense>
  );
}
