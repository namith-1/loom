import { create } from 'zustand';

export type Participant = {
  id: string;
  name: string;
  initial: string;
  color: string;
  isHost: boolean;
  isMe: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isPinned: boolean;
  isSpotlighted: boolean;
  peerId?: string;
  stream?: MediaStream;
  handRaised: boolean;
  reaction?: string;
};

// Colors for random assignment when participants join
export const participantColors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500'];

type ViewMode = 'speaker' | 'gallery' | 'multi-speaker';
type RightPanel = 'participants' | 'chat' | null;
type PopoverType = 'info' | 'view' | 'react' | 'more' | 'end' | 'assign-host' | 'leave' | null;

interface MeetingState {
  participants: Participant[];
  viewMode: ViewMode;
  rightPanel: RightPanel;
  activePopover: PopoverType;
  meetingTitle: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isCurrentUserHost: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  
  originalHostId: string | null;
  setOriginalHostId: (id: string | null) => void;
  
  // Actions
  setParticipants: (participants: Participant[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setRightPanel: (panel: RightPanel) => void;
  setActivePopover: (popover: PopoverType) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  pinParticipant: (id: string) => void;
  spotlightParticipant: (id: string) => void;
  setIsCurrentUserHost: (isHost: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (attendeeId: string, stream: MediaStream) => void;
  sendWebSocketEvent: (payload: any) => void;
  toggleHand: () => void;
  sendReaction: (emoji: string) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  participants: [],
  viewMode: 'speaker',
  rightPanel: null,
  activePopover: null,
  meetingTitle: "Meeting",
  isMuted: false,
  isVideoOff: false,
  isCurrentUserHost: false,
  localStream: null,
  remoteStreams: {},

  originalHostId: null,
  setOriginalHostId: (id: string | null) => set({ originalHostId: id }),

  setParticipants: (participants) => set({ participants }),
  setViewMode: (mode) => set({ viewMode: mode, activePopover: null }),
  setRightPanel: (panel) => set({ rightPanel: panel }),
  setActivePopover: (popover) => set((state) => ({ 
    activePopover: state.activePopover === popover ? null : popover 
  })),
  toggleMute: () => set((state) => {
    const newMuted = !state.isMuted;
    if (state.localStream && state.localStream.getAudioTracks().length > 0) {
      state.localStream.getAudioTracks().forEach(t => t.enabled = !newMuted);
    }
    
    const participants = state.participants.map(p => 
      p.isMe ? { ...p, isMuted: newMuted } : p
    );
    
    if (state.sendWebSocketEvent) {
      state.sendWebSocketEvent({ event: 'STATE_UPDATE', audio_on: !newMuted });
    }
    
    return { isMuted: newMuted, participants };
  }),
  toggleVideo: () => set((state) => {
    const newVideoOff = !state.isVideoOff;
    if (state.localStream && state.localStream.getVideoTracks().length > 0) {
      state.localStream.getVideoTracks().forEach(t => t.enabled = !newVideoOff);
    }
    
    const participants = state.participants.map(p => 
      p.isMe ? { ...p, isVideoOff: newVideoOff } : p
    );
    
    if (state.sendWebSocketEvent) {
      state.sendWebSocketEvent({ event: 'STATE_UPDATE', camera_on: !newVideoOff });
    }
    
    return { isVideoOff: newVideoOff, participants };
  }),
  setIsCurrentUserHost: (isHost) => set({ isCurrentUserHost: isHost }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (attendeeId, stream) => set((state) => ({
    remoteStreams: { ...state.remoteStreams, [attendeeId]: stream }
  })),
  sendWebSocketEvent: () => {}, // Replaced by usePeerJS hook
  
  pinParticipant: (id) => set((state) => {
    // Zoom allows multiple pins, but for simplicity we'll toggle pin on one or set exclusively
    const newParticipants = state.participants.map(p => ({
      ...p,
      isPinned: p.id === id ? !p.isPinned : false // exclusive pin
    }));
    return { participants: newParticipants, viewMode: 'speaker' };
  }),

  spotlightParticipant: (id) => set((state) => {
    // Spotlight applies to everyone, we mock it by setting it locally
    const newParticipants = state.participants.map(p => ({
      ...p,
      isSpotlighted: p.id === id ? !p.isSpotlighted : false // exclusive spotlight
    }));
    return { participants: newParticipants, viewMode: 'speaker' };
  }),

  toggleHand: () => set((state) => {
    const me = state.participants.find(p => p.isMe);
    if (me && state.sendWebSocketEvent) {
      state.sendWebSocketEvent({ event: 'TOGGLE_HAND', hand_raised: !me.handRaised });
    }
    return state;
  }),
  
  sendReaction: (emoji: string) => set((state) => {
    if (state.sendWebSocketEvent) {
      state.sendWebSocketEvent({ event: 'SEND_REACTION', reaction: emoji });
    }
    return state;
  }),
}));
