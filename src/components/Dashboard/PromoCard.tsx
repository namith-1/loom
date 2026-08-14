"use client";

import React from 'react';

export default function PromoCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex items-center justify-between overflow-hidden relative">
      <div className="max-w-md z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">zoom</span>
          <span className="text-blue-600 font-semibold">Workplace Pro</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Limited time offer!</h3>
        <p className="text-sm text-gray-600 mb-4">
          Take an additional 15% off when you upgrade to Zoom Workplace Pro annual!
        </p>
        <p className="text-xs text-gray-500 mb-6">Terms apply.</p>
        <button className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Get offer
        </button>
      </div>
      
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent to-blue-50"></div>
      
      {/* Mock Graphic */}
      <div className="hidden md:flex w-64 h-48 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-xl overflow-hidden relative z-10 shadow-lg">
        {/* Placeholder for the complex image in the original */}
        <div className="absolute inset-2 border-2 border-green-400 rounded-lg flex flex-col p-2">
            <div className="flex-1 bg-white/20 rounded mb-1 flex items-center justify-center text-3xl">😊</div>
            <div className="flex gap-1 h-1/3">
                <div className="flex-1 bg-white/20 rounded flex items-center justify-center text-xl">🧔</div>
                <div className="flex-1 bg-white/20 rounded flex items-center justify-center text-xl">👩</div>
            </div>
        </div>
      </div>
    </div>
  );
}
