"use client";

import React from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import Link from 'next/link';

export default function ProfileCard() {
  const { user } = useDashboardStore();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#7B52AB] text-3xl font-semibold text-white">
          {user.initials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Plan: <span className="font-semibold text-gray-900">{user.plan}</span>
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <button className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
          Manage Plan
        </button>
        <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
          View Plan Details
        </Link>
      </div>
    </div>
  );
}
