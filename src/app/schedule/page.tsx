"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStore, Meeting } from '@/store/useDashboardStore';
import { ShieldCheck, Info } from 'lucide-react';
import TopNav from '@/components/Layout/TopNav';
import Sidebar from '@/components/Layout/Sidebar';

export default function SchedulePage() {
  const router = useRouter();
  const { user } = useDashboardStore();
  
  const [topic, setTopic] = useState('My Meeting');
  const [date, setDate] = useState('2026-08-13');
  const [time, setTime] = useState('11:30');
  const [ampm, setAmpm] = useState('PM');
  const [durationHr, setDurationHr] = useState('0');
  const [durationMin, setDurationMin] = useState('40');
  const [timeZone, setTimeZone] = useState('(GMT+5:30) India');

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !date || !time) return;
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const apiHost = process.env.NEXT_PUBLIC_WS_URL 
        ? process.env.NEXT_PUBLIC_WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')
        : `${protocol}//${window.location.hostname}:8000`;
        
      const res = await fetch(`${apiHost}/api/meetings/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic,
          date,
          time: `${time} ${ampm}`,
          secure_with_pwd: true
        }),
        credentials: 'include'
      });
      
      if (res.ok) {
        router.push('/'); // redirect back to home
      } else {
        const errText = await res.text();
        alert('Failed to schedule: ' + errText);
      }
    } catch (err) {
      console.error(err);
      alert('Error scheduling meeting');
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Schedule Meeting</h2>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-8 py-6 max-w-5xl">
            <form id="schedule-form" onSubmit={handleSchedule} className="space-y-8">
              
              {/* Topic */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 mt-2">
                  <span className="text-red-500">*</span> Topic
                </label>
                <div>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full max-w-lg rounded border border-gray-300 px-3 py-1.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    required
                  />
                  <button type="button" className="text-blue-600 text-sm mt-2 flex items-center hover:underline">
                    + Add Description
                  </button>
                </div>
              </div>

              {/* When */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">When</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm w-40"
                    required
                  />
                  <select 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm w-28"
                  >
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="12:00">12:00</option>
                    <option value="12:30">12:30</option>
                  </select>
                  <select 
                    value={ampm}
                    onChange={(e) => setAmpm(e.target.value)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm w-20"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 mt-2">Duration</label>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <select 
                      value={durationHr}
                      onChange={(e) => setDurationHr(e.target.value)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm w-20"
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                    </select>
                    <span className="text-sm text-gray-600">hr</span>
                    <select 
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm w-20 ml-2"
                    >
                      <option value="0">0</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="40">40</option>
                      <option value="45">45</option>
                    </select>
                    <span className="text-sm text-gray-600">min</span>
                  </div>
                  
                  <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 max-w-3xl flex gap-3">
                    <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      You can schedule meetings for up to 40 minutes each with your current Basic plan. Need more time?<br/>
                      <a href="#" className="text-blue-600 hover:underline">Upgrade to Zoom Workplace Pro</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Zone */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 mt-2">Time Zone</label>
                <div>
                  <select 
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full max-w-md rounded border border-gray-300 px-3 py-1.5 text-sm"
                  >
                    <option value="(GMT+5:30) India">(GMT+5:30) India</option>
                    <option value="(GMT-8:00) Pacific Time">(GMT-8:00) Pacific Time</option>
                  </select>
                  <div className="mt-4 flex items-center gap-2">
                    <input type="checkbox" id="recurring" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="recurring" className="text-sm text-gray-700">Recurring meeting</label>
                  </div>
                </div>
              </div>

              {/* Invitees */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 mt-2">Invitees</label>
                <div>
                  <input 
                    type="text" 
                    placeholder="Enter user names or email addresses" 
                    className="w-full max-w-lg rounded border border-gray-300 px-3 py-1.5 text-sm mb-4"
                  />
                  <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 max-w-3xl flex gap-3">
                    <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      Participants won&apos;t receive this meeting invite until your calendar is connected.<br/>
                      <a href="#" className="text-blue-600 hover:underline">Connect calendar</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Meeting ID */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Meeting ID</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="meetingId" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                    Generate Automatically
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="meetingId" className="text-blue-600 focus:ring-blue-500" />
                    Personal Meeting ID {user.pmi}
                  </label>
                </div>
              </div>

              {/* Template */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Template</label>
                <select className="w-full max-w-md rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-500">
                  <option>Select a template</option>
                </select>
              </div>

              {/* Whiteboard */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Whiteboard <Info className="h-3 w-3 text-gray-400" />
                </label>
                <button type="button" className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded px-3 py-1.5 text-sm font-medium w-max transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  Add Whiteboard
                </button>
              </div>

              {/* Docs */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Docs</label>
                <button type="button" className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded px-3 py-1.5 text-sm font-medium w-max transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Add Docs
                </button>
              </div>

              {/* Security */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700 mt-2">Security</label>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-gray-100" />
                        Passcode
                      </label>
                      <input type="text" defaultValue="b2WvV2" className="w-24 rounded border border-gray-300 px-3 py-1 text-sm bg-gray-50" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">Only users who have the invite link or passcode can join the meeting</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      Waiting Room
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">Only users admitted by the host can join the meeting</p>
                  </div>
                </div>
              </div>

              {/* Encryption */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-center border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700">Encryption</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="encryption" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    Enhanced encryption <Info className="h-3 w-3 text-gray-400" />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="encryption" className="text-blue-600 focus:ring-blue-500" />
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    End-to-end encryption <Info className="h-3 w-3 text-gray-400" />
                  </label>
                </div>
              </div>

              {/* Zoom AI */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700 mt-1">Zoom AI</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Automatically start Zoom AI <Info className="h-3 w-3 text-gray-400" />
                  </label>
                  <div className="pl-6 space-y-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      Automatically start meeting questions
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      Automatically start meeting summary
                    </label>
                  </div>
                </div>
              </div>

              {/* Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700">Workflow</label>
                <div>
                  <a href="#" className="text-sm text-blue-600 hover:underline">Attach workflow to this meeting</a>
                </div>
              </div>

              {/* My Notes */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700 mt-1">My Notes</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Allow participants to transcribe meeting with My Notes
                  </label>
                  <div className="pl-6 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" name="mynotes" className="text-blue-600 focus:ring-blue-500" />
                      Only participants in your organization
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" name="mynotes" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                      All participants
                    </label>
                  </div>
                </div>
              </div>

              {/* Meeting chat */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700">Meeting chat</label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Allow users to access meeting chats before and after the meeting
                </label>
              </div>

              {/* Video */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700 mt-1">Video</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-8 text-sm">
                    <span className="w-20 text-gray-700">Host</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="videoHost" defaultChecked className="text-blue-600 focus:ring-blue-500" /> on
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="videoHost" className="text-blue-600 focus:ring-blue-500" /> off
                    </label>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <span className="w-20 text-gray-700">Participant</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="videoParticipant" defaultChecked className="text-blue-600 focus:ring-blue-500" /> on
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="videoParticipant" className="text-blue-600 focus:ring-blue-500" /> off
                    </label>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8">
                <label className="text-sm font-medium text-gray-700">Options</label>
                <a href="#" className="text-sm text-blue-600 hover:underline">Show</a>
              </div>

              {/* Interpretation */}
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start border-t border-gray-100 pt-8 pb-12">
                <label className="text-sm font-medium text-gray-700">Interpretation</label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Select sign language interpretation video channels below. You can assign interpreters at any time.
                </label>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-6">
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-full bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button 
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
