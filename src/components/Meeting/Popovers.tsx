import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMeetingStore } from '@/store/useMeetingStore';
import { Check, Copy, Grip, MonitorPlay, Settings, Presentation, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSearchParams } from 'next/navigation';

export default function Popovers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activePopover, setActivePopover, meetingTitle, viewMode, setViewMode } = useMeetingStore();
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, emoji: string}[]>([]);
  const emojiIdRef = React.useRef(0);

  const meetingId = searchParams.get('meetingId') || '';
  const pwd = searchParams.get('pwd') || '';
  const hostName = typeof window !== 'undefined' ? window.location.host : '';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const inviteLink = `${protocol}//${hostName}/launch?meetingId=${meetingId}&pwd=${pwd}`;

  if (!activePopover) return null;

  const handleReact = (emoji: string) => {
    // Also broadcast reaction
    useMeetingStore.getState().sendReaction(emoji);
    
    // Spawn floating emoji locally for immediate feedback
    emojiIdRef.current += 1;
    const id = emojiIdRef.current;
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    setActivePopover(null);
    
    // Remove after animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 5000);
  };

  const handleLeave = async () => {
    setActivePopover(null);
    try {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const apiHost = process.env.NEXT_PUBLIC_WS_URL 
        ? process.env.NEXT_PUBLIC_WS_URL.replace('ws:', 'http:').replace('wss:', 'https:')
        : `${protocol}//${window.location.hostname}:8000`;
        
      await fetch(`${apiHost}/api/meetings/leave`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error("Failed to leave meeting cleanly", e);
    }
    router.push('/');
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <>
      {/* Floating Emojis Overlay */}
      {floatingEmojis.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center pb-32">
          {floatingEmojis.map(e => (
            <div key={e.id} className="text-6xl animate-bounce-up opacity-0 absolute">
              {e.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Info Popover */}
      {activePopover === 'info' && (
        <div className="absolute top-12 left-4 w-[340px] bg-[#242424] rounded-lg shadow-2xl border border-gray-700 z-50 text-sm overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold text-lg">{meetingTitle}</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-[110px_1fr] items-start gap-2">
              <span className="text-gray-400">Invite Link</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-blue-400 truncate flex-1" title={inviteLink}>{inviteLink}</span>
                <button 
                  onClick={handleCopyInvite}
                  className="text-gray-400 hover:text-white bg-gray-700/50 p-1.5 rounded transition-opacity flex-shrink-0"
                  title="Copy Link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[130px_1fr] items-start gap-2">
              <span className="text-gray-400">Meeting ID</span>
              <span className="text-gray-200">{meetingId}</span>
            </div>
            {pwd && (
              <div className="grid grid-cols-[130px_1fr] items-start gap-2">
                <span className="text-gray-400">Passcode</span>
                <span className="text-gray-200">{pwd}</span>
              </div>
            )}
            <div className="grid grid-cols-[130px_1fr] items-start gap-2">
              <span className="text-gray-400 leading-tight">Telephone/Room Systems</span>
              <span className="text-gray-200"></span>
            </div>
            <div className="grid grid-cols-[130px_1fr] items-start gap-2 mt-2">
              <span className="text-gray-400">Participant ID</span>
              <span className="text-gray-400 bg-gray-800 px-1 rounded w-max">137308</span>
            </div>
          </div>
        </div>
      )}

      {/* View Popover */}
      {activePopover === 'view' && (
        <div className="absolute top-12 right-4 w-[240px] bg-[#1a1a1a] rounded-lg shadow-2xl border border-gray-700 z-50 py-2">
          <button 
            onClick={() => { setViewMode('speaker'); setActivePopover(null); }}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-600/20 text-gray-200 text-sm group"
          >
            <div className="flex items-center gap-2">
              <Check className={cn("w-4 h-4", viewMode === 'speaker' ? "opacity-100" : "opacity-0")} />
              Speaker View
            </div>
            <MonitorPlay className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
          <button 
            onClick={() => { setViewMode('gallery'); setActivePopover(null); }}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-600/20 text-gray-200 text-sm group"
          >
            <div className="flex items-center gap-2">
              <Check className={cn("w-4 h-4", viewMode === 'gallery' ? "opacity-100" : "opacity-0")} />
              Gallery View
            </div>
            <Grip className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
          <button 
            onClick={() => { setViewMode('multi-speaker'); setActivePopover(null); }}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-600/20 text-gray-200 text-sm group"
          >
            <div className="flex items-center gap-2">
              <Check className={cn("w-4 h-4", viewMode === 'multi-speaker' ? "opacity-100" : "opacity-0")} />
              Multi-speaker View
            </div>
            <Grip className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>

          <div className="h-px bg-gray-800 my-2" />
          
          <button className="w-full px-10 py-2 flex items-center justify-between hover:bg-blue-600/20 text-gray-200 text-sm">
            Sort Gallery By
            <span className="text-gray-400">›</span>
          </button>

          <div className="h-px bg-gray-800 my-2" />
          
          <button className="w-full px-10 py-2 text-left hover:bg-blue-600/20 text-gray-200 text-sm">
            Hide Self View
          </button>
          <button className="w-full px-10 py-2 text-left hover:bg-blue-600/20 text-gray-200 text-sm">
            Hide Non-video Participants
          </button>

          <div className="h-px bg-gray-800 my-2" />

          <button className="w-full px-10 py-2 text-left hover:bg-blue-600/20 text-gray-200 text-sm flex items-center gap-2">
            Fullscreen
          </button>
        </div>
      )}

      {/* React Popover */}
      {activePopover === 'react' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[340px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-700 z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            {['👏', '👍', '😂', '😮', '❤️', '🎉'].map(emoji => (
              <button 
                key={emoji} 
                onClick={() => handleReact(emoji)}
                className="text-2xl hover:scale-125 transition-transform origin-bottom"
              >
                {emoji}
              </button>
            ))}
            <button className="text-gray-400 hover:text-white">•••</button>
          </div>
          
          <div className="flex justify-between gap-2 mb-4">
            <button className="flex-1 bg-[#2a2a2a] hover:bg-[#333] rounded-lg py-2 flex justify-center items-center text-green-500 font-bold border border-transparent hover:border-gray-600">✓</button>
            <button className="flex-1 bg-[#2a2a2a] hover:bg-[#333] rounded-lg py-2 flex justify-center items-center text-red-500 font-bold border border-transparent hover:border-gray-600">✕</button>
            <button className="flex-1 bg-[#2a2a2a] hover:bg-[#333] rounded-lg py-2 flex justify-center items-center text-blue-300 font-bold border border-transparent hover:border-gray-600">«</button>
            <button className="flex-1 bg-[#2a2a2a] hover:bg-[#333] rounded-lg py-2 flex justify-center items-center text-blue-500 font-bold border border-transparent hover:border-gray-600">»</button>
            <button className="flex-1 bg-[#2a2a2a] hover:bg-[#333] rounded-lg py-2 flex justify-center items-center text-gray-300 border border-transparent hover:border-gray-600">☕</button>
          </div>

          <button 
            onClick={() => {
              useMeetingStore.getState().toggleHand();
              setActivePopover(null);
            }}
            className="w-full bg-[#2a2a2a] hover:bg-[#333] rounded-lg py-3 flex justify-center items-center gap-2 text-white font-medium mb-2 border border-transparent hover:border-gray-600"
          >
            {useMeetingStore.getState().participants.find(p => p.isMe)?.handRaised ? '✋ Lower Hand' : '✋ Raise Hand'}
          </button>
          <button className="w-full bg-[#2a2a2a] hover:bg-[#333] rounded-lg py-3 flex justify-center items-center gap-2 text-white font-medium border border-transparent hover:border-gray-600">
            ⏳ Be right back
          </button>
        </div>
      )}

      {/* More Popover */}
      {activePopover === 'more' && (
        <div className="absolute bottom-20 right-32 w-[300px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-700 z-50 p-4">
          <div className="flex justify-between mb-4">
            <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-white p-2">
              <Presentation className="w-6 h-6" />
              <span className="text-xs">Whiteboards</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-white p-2">
              <Settings className="w-6 h-6" />
              <span className="text-xs">Settings</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-white p-2">
              <VideoOff className="w-6 h-6" />
              <span className="text-xs text-center leading-tight">Stop Incoming<br/>Video</span>
            </button>
          </div>
          
          <div className="h-px bg-gray-800 my-4" />
          
          <div className="text-center text-sm text-gray-400 flex items-center justify-center gap-2">
            Reset to default <button className="text-blue-500 hover:underline">Reset</button>
          </div>
        </div>
      )}
      {/* End Popover */}
      {activePopover === 'end' && (
        <div className="absolute bottom-20 right-4 w-[280px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-700 z-50 p-4">
          <button 
            onClick={() => {
              useMeetingStore.getState().sendWebSocketEvent({ event: 'END_MEETING' });
              setActivePopover(null);
            }}
            className="w-full bg-[#e02828] hover:bg-[#c92222] text-white font-medium py-3 rounded-lg mb-3 transition-colors"
          >
            End Meeting for All
          </button>
          <button 
            onClick={() => setActivePopover('assign-host')}
            className="w-full bg-[#2a2a2a] hover:bg-[#333] text-white font-medium py-3 rounded-lg mb-4 transition-colors"
          >
            Leave Meeting
          </button>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
              <input type="checkbox" className="rounded bg-black border-gray-600 text-blue-500" />
              Give feedback
            </label>
            <button 
              onClick={() => setActivePopover(null)}
              className="text-gray-300 hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Assign Host Popover */}
      {activePopover === 'assign-host' && (
        <div className="absolute bottom-20 right-4 w-[280px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-700 z-50 p-4">
          <h3 className="text-white font-bold text-lg mb-4">Assign a New Host</h3>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-md bg-[#e67c22] flex items-center justify-center text-white font-medium text-sm">
              NR
            </div>
            <span className="text-gray-200 text-sm">namith raj(Guest)</span>
          </div>

          <button 
            onClick={handleLeave}
            className="w-full bg-[#8b2323] hover:bg-[#7a1e1e] text-gray-300 hover:text-white font-medium py-3 rounded-lg mb-4 transition-colors"
          >
            Assign and Leave
          </button>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
              <input type="checkbox" className="rounded bg-black border-gray-600 text-blue-500" />
              Give feedback
            </label>
            <button 
              onClick={() => setActivePopover('end')}
              className="text-gray-300 hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leave Popover (Participant) */}
      {activePopover === 'leave' && (
        <div className="absolute bottom-20 right-4 w-[280px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-700 z-50 p-4">
          <button 
            onClick={handleLeave}
            className="w-full bg-[#e02828] hover:bg-[#c92222] text-white font-medium py-3 rounded-lg mb-4 transition-colors"
          >
            Leave Meeting
          </button>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
              <input type="checkbox" className="rounded bg-black border-gray-600 text-blue-500" />
              Give feedback
            </label>
            <button 
              onClick={() => setActivePopover(null)}
              className="text-gray-300 hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {activePopover === 'invite' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl border border-gray-800 shadow-2xl flex flex-col">
            <div className="p-6 pb-4">
              <h2 className="text-white text-xl font-bold text-center">
                Invite People to join meeting {meetingId.match(/.{1,3}/g)?.join(' ') || meetingId}
              </h2>
            </div>
            
            <div className="flex-1 min-h-[300px] p-6 text-gray-400 flex items-center justify-center">
              <p className="text-sm">Select the copy options below to invite participants.</p>
            </div>

            <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-[#242424] rounded-b-xl">
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleCopyInvite}
                  className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                >
                  Copy URL
                </button>
                <button 
                  onClick={() => {
                    const text = `You are invited to a Zoom meeting.\n\nMeeting ID: ${meetingId}\n${pwd ? `Passcode: ${pwd}\n` : ''}\nJoin link: ${inviteLink}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                >
                  Copy Invitation
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                {pwd && (
                  <span className="text-gray-400 text-sm">
                    Passcode: <span className="text-white font-medium">{pwd}</span>
                  </span>
                )}
                <button 
                  onClick={() => setActivePopover(null)}
                  className="px-4 py-1.5 rounded bg-[#333] hover:bg-[#444] text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
