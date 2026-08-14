"use client";

import React from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';

export default function Modals() {
  const { isJoinModalOpen, setJoinModalOpen } = useDashboardStore();

  return (
    <>
      {/* Join Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Join Meeting</h2>
            <input 
              type="text" 
              placeholder="Meeting ID or Personal Link Name" 
              className="w-full rounded-md border border-gray-300 p-2 mb-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setJoinModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => setJoinModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
