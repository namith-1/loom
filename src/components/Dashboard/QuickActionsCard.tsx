"use client";

import React, { useState } from 'react';
import { Calendar, Plus, Video, Copy } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useRouter } from 'next/navigation';
import { createMeeting } from '@/lib/api';

export default function QuickActionsCard() {
  const router = useRouter();
  const { setJoinModalOpen, setScheduleModalOpen, user, setSession } = useDashboardStore();
  const [isHosting, setIsHosting] = useState(false);

  const handleHostNewMeeting = async () => {
    setIsHosting(true);
    try {
      const data = await createMeeting('My Instant Meeting', true);
      // Automatically redirect the host to the launch page
      router.push(data.invite_link);
    } catch (err) {
      console.error(err);
      setIsHosting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col items-center">
      <div className="flex w-full justify-between px-4 mb-8">
        
        <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => router.push('/schedule')}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white group-hover:bg-blue-700 transition-colors shadow-md">
            <Calendar className="h-8 w-8" />
          </div>
          <span className="text-sm font-medium text-gray-700">Schedule</span>
        </div>

        <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => router.push('/join')}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white group-hover:bg-blue-700 transition-colors shadow-md">
            <Plus className="h-8 w-8" />
          </div>
          <span className="text-sm font-medium text-gray-700">Join</span>
        </div>

        <div 
          className="flex flex-col items-center gap-2 group cursor-pointer" 
          onClick={handleHostNewMeeting}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white group-hover:bg-orange-600 transition-colors shadow-md">
            <Video className="h-8 w-8" />
          </div>
          <span className="text-sm font-medium text-gray-700">{isHosting ? 'Starting...' : 'Host'}</span>
        </div>

      </div>

      <div className="w-full pt-6 border-t border-gray-100 flex flex-col items-center">
        <p className="text-sm font-medium text-gray-900">Personal Meeting ID</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-semibold text-gray-700">{user.pmi}</span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
