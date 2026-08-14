import React from 'react';
import { useMeetingStore, Participant } from '@/store/useMeetingStore';
import { MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const ParticipantCard = ({ 
  participant, 
  isMain = false,
  onClick
}: { 
  participant: Participant, 
  isMain?: boolean,
  onClick?: () => void
}) => {
  const { pinParticipant, spotlightParticipant, remoteStreams, localStream } = useMeetingStore();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const mediaStream = participant.isMe ? localStream : remoteStreams[participant.id];

  // Check if we have media to show
  const hasLiveVideo = Boolean(
    mediaStream?.getVideoTracks().some((track) => track.readyState === 'live' && track.enabled)
  );
  const hasLiveAudio = Boolean(
    mediaStream?.getAudioTracks().some((track) => track.readyState === 'live' && track.enabled)
  );
  const showVideo = hasLiveVideo && (participant.isMe ? !participant.isVideoOff : true);
  const showMutedIcon = participant.isMuted && !hasLiveAudio;

  React.useEffect(() => {
    if (videoRef.current && mediaStream && showVideo) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      videoRef.current.play().catch(() => undefined);
    }

    if (audioRef.current && mediaStream && hasLiveAudio && !participant.isMe) {
      if (audioRef.current.srcObject !== mediaStream) {
        audioRef.current.srcObject = mediaStream;
      }
      audioRef.current.play().catch(() => undefined);
    }
  }, [mediaStream, participant.isMe, showVideo, hasLiveAudio]);

  return (
    <div 
      className={cn(
        "relative bg-[#242424] overflow-hidden group border-2 transition-colors",
        participant.isSpotlighted ? "border-yellow-500" : "border-transparent hover:border-gray-600",
        isMain ? "w-full h-full rounded-xl" : "w-full aspect-video rounded-lg"
      )}
      onClick={onClick}
    >
      {!participant.isMe && hasLiveAudio && (
        <audio ref={audioRef} autoPlay playsInline />
      )}

      {/* Video Element */}
      {showVideo ? (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted={participant.isMe} // Mute local playback to avoid echo
          className={cn("w-full h-full object-cover", participant.isMe && "scale-x-[-1]")}
        />
      ) : (
        /* Fallback avatar if video is off */
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <div className={cn(
            "rounded-full flex items-center justify-center text-white font-medium shadow-lg",
            participant.color,
            isMain ? "w-32 h-32 text-5xl" : "w-12 h-12 text-xl"
          )}>
            {participant.initial}
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-2 backdrop-blur-sm z-10">
        {showMutedIcon && <MicOff className="w-3 h-3 text-red-500" />}
        {participant.name}
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); pinParticipant(participant.id); }}
          className={cn(
            "p-1.5 rounded bg-black/60 text-white hover:bg-blue-600 transition-colors",
            participant.isPinned && "bg-blue-600"
          )}
          title={participant.isPinned ? "Unpin" : "Pin"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); spotlightParticipant(participant.id); }}
          className={cn(
            "p-1.5 rounded bg-black/60 text-white hover:bg-yellow-500 transition-colors",
            participant.isSpotlighted && "bg-yellow-500"
          )}
          title={participant.isSpotlighted ? "Remove Spotlight" : "Spotlight for Everyone"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default function VideoGrid() {
  const { participants, viewMode, setActivePopover } = useMeetingStore();

  const handleGridClick = () => {
    setActivePopover(null);
  };

  if (viewMode === 'gallery') {
    // Determine grid columns based on participant count
    let gridClass = "grid-cols-2";
    if (participants.length > 4) gridClass = "grid-cols-3";
    if (participants.length > 9) gridClass = "grid-cols-4";
    if (participants.length > 16) gridClass = "grid-cols-5";

    return (
      <div className="flex-1 w-full p-4 overflow-y-auto custom-scrollbar" onClick={handleGridClick}>
        <div className={cn("grid gap-4 auto-rows-max h-full max-w-[1600px] mx-auto items-center", gridClass)}>
          {participants.map(p => (
            <ParticipantCard key={p.id} participant={p} />
          ))}
        </div>
      </div>
    );
  }

  // Speaker View
  const pinnedOrSpotlighted = participants.find(p => p.isPinned || p.isSpotlighted);
  const host = participants.find(p => p.isHost);
  const me = participants.find(p => p.isMe);
  
  // Priority: Pinned/Spotlighted > Host > Me (if no one else)
  const mainParticipant = pinnedOrSpotlighted || host || me || participants[0];
  
  if (!mainParticipant) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-black text-white" onClick={handleGridClick}>
        <div className="animate-pulse">Waiting for media...</div>
      </div>
    );
  }

  const others = participants.filter(p => p.id !== mainParticipant.id);

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden" onClick={handleGridClick}>
      
      {/* Top strip of other participants */}
      {others.length > 0 && (
        <div className="h-40 w-full bg-black flex justify-center items-center gap-2 px-4 py-2 overflow-x-auto hide-scrollbar flex-shrink-0">
          {others.slice(0, 5).map(p => (
            <div key={p.id} className="h-full w-auto aspect-video">
              <ParticipantCard participant={p} />
            </div>
          ))}
        </div>
      )}

      {/* Main Speaker */}
      <div className="flex-1 p-4 pb-0 flex items-center justify-center">
        <div className="w-full max-w-[1200px] h-full">
          <ParticipantCard participant={mainParticipant} isMain />
        </div>
      </div>
      
    </div>
  );
}
