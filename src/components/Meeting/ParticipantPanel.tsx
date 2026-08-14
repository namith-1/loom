import React from 'react';
import { useMeetingStore } from '@/store/useMeetingStore';
import { MicOff, VideoOff, ExternalLink, ChevronDown } from 'lucide-react';

export default function ParticipantPanel() {
  const { participants, rightPanel, setRightPanel, sendWebSocketEvent } = useMeetingStore();

  if (rightPanel !== 'participants') return null;

  const isMeHost = participants.find(p => p.isMe)?.isHost;

  return (
    <div className="w-full md:w-[320px] absolute md:relative top-0 right-0 bg-[#242424] border-l border-gray-800 flex flex-col h-full flex-shrink-0 z-30 shadow-xl">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
        <span className="text-gray-200 font-medium text-sm flex-1 text-center">
          Participants ({participants.length})
        </span>
        <div className="flex items-center gap-3">
          <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-200 cursor-pointer" />
          <ChevronDown 
            className="w-5 h-5 text-gray-400 hover:text-gray-200 cursor-pointer" 
            onClick={() => setRightPanel(null)}
          />
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {participants.map(p => (
          <div key={p.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-800/50 cursor-pointer group">
            <div className="flex items-center gap-3 truncate">
              <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${p.color}`}>
                {p.initial}
              </div>
              <div className="text-sm text-gray-200 truncate pr-2">
                {p.name}
                {p.isMe && <span className="text-gray-400"> (Me)</span>}
                {p.isHost && <span className="text-gray-400"> (Host)</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {isMeHost && !p.isMe && (
                <button 
                  onClick={() => sendWebSocketEvent({ event: 'KICK_PARTICIPANT', target_id: p.id })}
                  className="hidden group-hover:block px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white text-[10px] uppercase font-bold rounded"
                >
                  Remove
                </button>
              )}
              {p.isMuted && <MicOff className="w-4 h-4 text-red-500" />}
              {p.isVideoOff && <VideoOff className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="h-14 border-t border-gray-800 flex items-center justify-between px-4 flex-shrink-0 bg-[#242424]">
        <button className="px-4 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors">
          Invite
        </button>
        {isMeHost ? (
          <button 
            onClick={() => sendWebSocketEvent({ event: 'HOST_MUTE_ALL' })}
            className="px-4 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors"
          >
            Mute All
          </button>
        ) : (
          <button className="px-4 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors">
            Unmute
          </button>
        )}
      </div>
    </div>
  );
}
