"use client";

import React from 'react';
import TopNav from '@/components/Layout/TopNav';
import Sidebar from '@/components/Layout/Sidebar';
import { Eye, Info, X } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto py-8 px-8 space-y-10">
            
            {/* Header placeholder (assuming standard profile header might exist, but focusing on images) */}
            
            {/* Meeting Section */}
            <section>
              <div className="bg-gray-50 px-4 py-2 rounded font-semibold text-sm text-gray-800 mb-4">
                Meeting
              </div>
              
              <div className="space-y-6 px-4">
                <div className="grid grid-cols-[250px_1fr] items-start">
                  <div className="text-sm font-medium text-gray-600">Personal Meeting ID</div>
                  <div className="flex justify-between items-start">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 text-gray-900 mb-2">
                        *** *** *977 <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-gray-700 font-mono text-xs mb-2 truncate max-w-lg">
                        https://us05web.zoom.us/j/*******977?pwd=ZOUOqOEm3rkTFsFUBaFHJtblBOGeay.1
                      </div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <span className="text-gray-400">×</span> Use this ID for instant meetings
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">Edit</button>
                  </div>
                </div>

                <div className="grid grid-cols-[250px_1fr] items-start border-t border-gray-100 pt-6">
                  <div className="text-sm font-medium text-gray-600">Host Key</div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      ******** <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">Edit</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Section */}
            <section>
              <div className="bg-gray-50 px-4 py-2 rounded font-semibold text-sm text-gray-800 mb-4">
                Account
              </div>
              
              <div className="space-y-6 px-4">
                <div className="grid grid-cols-[250px_1fr] items-start">
                  <div className="text-sm font-medium text-gray-600">License</div>
                  <div>
                    <a href="#" className="text-blue-600 text-sm hover:underline mb-4 block">Upgrade to get more features</a>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-[200px_1fr] text-sm">
                        <span className="font-semibold text-gray-700">Zoom Chat</span>
                        <span className="text-gray-600">Enabled</span>
                      </div>
                      <div className="grid grid-cols-[200px_1fr] text-sm">
                        <span className="font-semibold text-gray-700">Zoom Meetings</span>
                        <div>
                          <div className="text-gray-600">Basic</div>
                          <div className="text-gray-500 text-xs mt-1">You can host up to 40 minutes per meeting.</div>
                          <a href="#" className="text-blue-600 text-xs hover:underline flex items-center gap-1 mt-1">
                            Increase Meeting Capacity <Info className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div className="grid grid-cols-[200px_1fr] text-sm">
                        <span className="font-semibold text-gray-700">Zoom Whiteboard</span>
                        <span className="text-gray-600">3 editable boards with standard features</span>
                      </div>
                      <div className="grid grid-cols-[200px_1fr] text-sm">
                        <span className="font-semibold text-gray-700">Zoom Scheduler</span>
                        <span className="text-gray-600">Enabled</span>
                      </div>
                      <div className="grid grid-cols-[200px_1fr] text-sm">
                        <span className="font-semibold text-gray-700">Zoom Clips Basic</span>
                        <span className="text-gray-600">Enabled</span>
                      </div>
                      <div className="grid grid-cols-[200px_1fr] text-sm">
                        <span className="font-semibold text-gray-700">Zoom Canvas</span>
                        <span className="text-gray-600">Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sign In Section */}
            <section>
              <div className="bg-gray-50 px-4 py-2 rounded font-semibold text-sm text-gray-800 mb-4">
                Sign In
              </div>
              
              <div className="space-y-6 px-4">
                <div className="grid grid-cols-[250px_1fr] items-start">
                  <div className="text-sm font-medium text-gray-600">Sign-In Email</div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      nrn***@gmail.com <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    <button className="text-blue-600 text-sm hover:underline">Edit</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-[250px_1fr] items-start border-t border-gray-100 pt-6">
                  <div className="text-sm font-medium text-gray-600">Linked Accounts</div>
                  <div className="text-sm text-gray-900">
                    Google
                  </div>
                </div>
              </div>
            </section>

            {/* Where you're logged in Section */}
            <section>
              <div className="bg-gray-50 px-4 py-2 rounded font-semibold text-sm text-gray-800 mb-4">
                Where you&apos;re logged in
              </div>
              
              <div className="px-4">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-medium">
                      <th className="py-3 font-medium">Devices Name</th>
                      <th className="py-3 font-medium">OS</th>
                      <th className="py-3 font-medium">Last Login Location</th>
                      <th className="py-3 font-medium">Last Login Time</th>
                      <th className="py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                          <div>
                            <div className="font-medium text-gray-900">Chrome</div>
                            <div className="text-xs text-gray-500">Chrome 151.0</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-700">Windows</td>
                      <td className="py-4 text-gray-700">Chennai, Tamil Nadu, India</td>
                      <td className="py-4 text-gray-700">08/13/2026 07:31 PM</td>
                      <td className="py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                  <a href="#" className="text-blue-600 text-sm hover:underline">Sign me out of all sessions</a>
                </div>
              </div>
            </section>

            {/* Others Section */}
            <section className="pb-16">
              <div className="bg-gray-50 px-4 py-2 rounded font-semibold text-sm text-gray-800 mb-4">
                Others
              </div>
              
              <div className="px-4 space-y-6">
                
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full bg-white">NEW</span>
                    <span className="text-sm text-gray-700">Try our calendar in the client and manage your meetings and events seamlessly!</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href="#" className="text-sm text-blue-600 hover:underline">Open Zoom Calendar Client</a>
                    <button className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-[250px_1fr] items-start">
                  <div className="text-sm font-medium text-gray-600">Calendar and Contacts Integration</div>
                  <div className="text-sm text-gray-700">
                    <p>We support the following services: Google Calendar, Microsoft Exchange, and Microsoft Office 365</p>
                    <p className="mt-1">If you want to add your contacts by importing a CSV file, go to <a href="#" className="text-blue-600 hover:underline">Personal Contacts</a>.</p>
                  </div>
                </div>
                
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
