"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/store/useDashboardStore';
import { ChevronDown } from 'lucide-react';

export default function TopNav() {
  const { user } = useDashboardStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          {/* Mock Zoom Logo */}
          <div className="text-blue-600 font-bold text-3xl tracking-tighter">zoom</div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-blue-600">Products</Link>
          <Link href="#" className="hover:text-blue-600">Solutions</Link>
          <Link href="#" className="hover:text-blue-600">Resources</Link>
          <Link href="#" className="hover:text-blue-600">Plans & Pricing</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
        <Link href="#" className="hidden sm:inline-block hover:text-blue-600">Support</Link>
        <Link href="/schedule" className="hidden sm:inline-block hover:text-blue-600">Schedule</Link>
        <Link href="/join" className="hidden sm:inline-block hover:text-blue-600">Join</Link>
        
        <div className="relative hidden sm:block">
          <button 
            onClick={() => setIsHostOpen(!isHostOpen)}
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
          >
            Host <ChevronDown className="h-4 w-4" />
          </button>
          
          {isHostOpen && (
            <div className="absolute right-0 mt-4 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
              <button onClick={async () => {
                setIsHostOpen(false);
                try {
                  const { createMeeting } = await import('@/lib/api');
                  const data = await createMeeting();
                  router.push(`/launch?meetingId=${data.meeting_id}&pwd=${data.passcode || ''}`);
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Unknown error';
                  alert('Failed to connect to Python backend server! Is it running? ' + message);
                }
              }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">With Video On</button>
              
              <button onClick={async () => {
                setIsHostOpen(false);
                try {
                  const { createMeeting } = await import('@/lib/api');
                  const data = await createMeeting();
                  router.push(`/launch?meetingId=${data.meeting_id}&pwd=${data.passcode || ''}`);
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Unknown error';
                  alert('Failed to connect to Python backend server! Is it running? ' + message);
                }
              }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">With Video Off</button>
              
              <button onClick={async () => {
                setIsHostOpen(false);
                try {
                  const { createMeeting } = await import('@/lib/api');
                  const data = await createMeeting();
                  router.push(`/launch?meetingId=${data.meeting_id}&pwd=${data.passcode || ''}`);
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : 'Unknown error';
                  alert('Failed to connect to Python backend server! Is it running? ' + message);
                }
              }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Screen Share Only</button>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1 cursor-pointer hover:text-blue-600">
          Web App <ChevronDown className="h-4 w-4" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7B52AB] text-white font-semibold hover:opacity-90"
          >
            {user.initials}
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="p-4 border-b">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.plan}</p>
              </div>
              <div className="py-1">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>Profile</Link>
                <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
