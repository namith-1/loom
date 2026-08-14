"use client";

import React from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/components/Layout/TopNav';
import Sidebar from '@/components/Layout/Sidebar';
import ProfileCard from '@/components/Dashboard/ProfileCard';
import PromoCard from '@/components/Dashboard/PromoCard';
import QuickActionsCard from '@/components/Dashboard/QuickActionsCard';
import MeetingsCard from '@/components/Dashboard/MeetingsCard';
import RecentActivityCard from '@/components/Dashboard/RecentActivityCard';

export default function Dashboard() {
  const { user, setSession } = useDashboardStore();
  const [nameInput, setNameInput] = React.useState('');
  
  // Only call hooks if we are on the client (Next.js client component)
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  if (!user.name) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          <div className="flex justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
            </div>
          </div>
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Welcome to Zoom Clone</h2>
          <p className="mb-8 text-center text-sm text-gray-500">Please enter your display name to continue.</p>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (nameInput.trim()) {
              try {
                const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
                const apiHost = process.env.NEXT_PUBLIC_WS_URL 
                  ? process.env.NEXT_PUBLIC_WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')
                  : `${protocol}//${window.location.hostname}:8000`;
                
                const res = await fetch(`${apiHost}/api/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: nameInput.trim() }),
                  credentials: 'include'
                });
                
                if (res.ok) {
                  const data = await res.json();
                  setSession(data.name, data.user_id);
                  if (returnTo) {
                    router.push(returnTo);
                  }
                }
              } catch (err) {
                console.error("Login failed", err);
              }
            }
          }} className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Display Name</label>
              <input
                id="name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name..."
                className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            
            {/* Top Grid: Profile & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
              
              <div className="space-y-6">
                <ProfileCard />
                <PromoCard />
              </div>
              
              <div className="space-y-6">
                <QuickActionsCard />
                <MeetingsCard />
              </div>

            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 gap-6">
              <RecentActivityCard />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
