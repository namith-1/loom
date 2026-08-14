import React from 'react';
import { useMeetingStore } from '@/store/useMeetingStore';
import { ShieldCheck, Info, Grid } from 'lucide-react';

export default function TopBar() {
  const { meetingTitle, setActivePopover } = useMeetingStore();

  return (
    <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-40 bg-gradient-to-b from-black/80 to-transparent">
      {/* Left section: Meeting Info */}
      <div className="flex items-center gap-3 relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setActivePopover('info');
          }}
          className="text-white hover:bg-white/10 p-1.5 rounded-md transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
        <div className="text-white font-medium text-sm drop-shadow-md">
          {meetingTitle}
        </div>
      </div>

      {/* Right section: Views */}
      <div className="flex items-center gap-3 relative mr-8">
        <div className="text-green-500 hover:bg-white/10 p-1.5 rounded-md cursor-pointer transition-colors" title="End-to-End Encryption">
          <ShieldCheck className="w-5 h-5" />
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setActivePopover('view');
          }}
          className="text-white flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded-md transition-colors border border-transparent hover:border-gray-600"
        >
          <Grid className="w-5 h-5" />
          <span className="text-xs font-medium bg-gray-800 rounded px-1 ml-1 text-white border border-gray-600">zm</span>
        </button>
      </div>
    </div>
  );
}
