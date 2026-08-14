import React from 'react';
import { useMeetingStore } from '@/store/useMeetingStore';
import { 
  Mic, MicOff, Video, VideoOff, 
  Users, MessageSquare, SmilePlus, 
  ArrowUpSquare, Sparkles, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomControlBar() {
  const { 
    isMuted, toggleMute, 
    isVideoOff, toggleVideo,
    rightPanel, setRightPanel,
    activePopover, setActivePopover,
    participants,
    isCurrentUserHost,
    localStream
  } = useMeetingStore();
  
  const [vol, setVol] = React.useState(0);

  React.useEffect(() => {
    if (!localStream || isMuted) {
      return;
    }
    
    if (localStream.getAudioTracks().length === 0) return;

    const AudioContextCtor = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioContext = new AudioContextCtor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(localStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationId: number;

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Map average (0-255) to a height percentage (0-100)
      const height = Math.min(100, Math.max(0, (average / 64) * 100)); // lower divisor makes it more sensitive
      setVol(height);
      animationId = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      cancelAnimationFrame(animationId);
      audioContext.close();
    };
  }, [localStream, isMuted]);

  const displayedVol = !localStream || isMuted ? 0 : vol;

  return (
    <div className="h-16 bg-[#1a1a1a] border-t border-gray-800 flex items-center justify-between px-2 sm:px-4 w-full z-40 flex-shrink-0 overflow-x-auto hide-scrollbar gap-2 sm:gap-4">
      
      {/* Left controls */}
      <div className="flex items-center gap-1">
        <button onClick={toggleMute} className="flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group">
          {isMuted ? (
            <MicOff className="w-5 h-5 text-red-500 mb-1" />
          ) : (
            <div className="flex items-end gap-1 mb-1">
              <Mic className="w-5 h-5 text-gray-300" />
              <div className="w-1 bg-gray-700 h-5 rounded-full overflow-hidden flex items-end">
                <div className="w-full bg-green-500 transition-all duration-75" style={{ height: `${displayedVol}%` }} />
              </div>
            </div>
          )}
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
        <button onClick={toggleVideo} className="flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group">
          {isVideoOff ? <VideoOff className="w-5 h-5 text-red-500 mb-1" /> : <Video className="w-5 h-5 text-gray-300 mb-1" />}
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
        </button>
      </div>

      {/* Center controls */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setRightPanel(rightPanel === 'participants' ? null : 'participants')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group relative",
            rightPanel === 'participants' && "bg-gray-800"
          )}
        >
          <div className="relative">
            <Users className="w-5 h-5 text-gray-300 mb-1" />
            <span className="absolute -top-1 -right-2 bg-gray-700 text-[9px] px-1 rounded text-white">{participants.length}</span>
          </div>
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300">Participants</span>
        </button>
        
        <button 
          onClick={() => setRightPanel(rightPanel === 'chat' ? null : 'chat')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group",
            rightPanel === 'chat' && "bg-gray-800"
          )}
        >
          <MessageSquare className="w-5 h-5 text-gray-300 mb-1" />
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300">Chat</span>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); setActivePopover('react'); }}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group relative",
            activePopover === 'react' && "bg-gray-800"
          )}
        >
          <SmilePlus className="w-5 h-5 text-gray-300 mb-1" />
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300">React</span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group">
          <ArrowUpSquare className="w-5 h-5 text-green-500 mb-1" />
          <span className="text-[10px] font-medium text-green-500">Share</span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group">
          <Sparkles className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300">Zoom AI</span>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); setActivePopover('more'); }}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-14 hover:bg-gray-800 rounded-lg group",
            activePopover === 'more' && "bg-gray-800"
          )}
        >
          <MoreHorizontal className="w-5 h-5 text-gray-300 mb-1" />
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-300">More</span>
        </button>
      </div>

      <div className="flex items-center pl-4 border-l border-gray-800 h-10 relative">
        {isCurrentUserHost ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setActivePopover('end'); }}
            className="flex items-center justify-center h-8 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors"
          >
            End Meeting
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); setActivePopover('leave'); }}
            className="flex items-center justify-center h-8 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors"
          >
            Leave Meeting
          </button>
        )}
      </div>

    </div>
  );
}
