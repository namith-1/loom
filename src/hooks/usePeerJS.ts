import { useCallback, useEffect, useRef } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { useMeetingStore, Participant } from '@/store/useMeetingStore';

type AttendeeMessage = {
  attendee_id: string;
  display_name: string;
  is_host: boolean;
  camera_on: boolean;
  audio_on: boolean;
  peer_id?: string | null;
};

type MeetingMessage = {
  event?: string;
  attendee_id?: string;
  peerId?: string;
  original_host_id?: string;
  attendees?: Record<string, AttendeeMessage>;
};

type ServerStateUpdate = Partial<{
  audio_on: boolean;
  camera_on: boolean;
  screen_sharing: boolean;
}>;

type CallMetadata = {
  fromAttendeeId?: string;
};

const getCallableStream = (stream: MediaStream | null) => {
  if (stream && stream.getTracks().length > 0) return stream;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dummyVideo = canvas.captureStream().getVideoTracks()[0];
    dummyVideo.enabled = false;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = ctx.createMediaStreamDestination();
    const dummyAudio = dest.stream.getAudioTracks()[0];
    dummyAudio.enabled = false;

    return new MediaStream([dummyVideo, dummyAudio]);
  } catch (e) {
    return new MediaStream();
  }
};

export function usePeerJS(meetingId: string, attendeeId: string, displayName: string, enabled: boolean = true) {
  const metadataWsRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<Record<string, MediaConnection>>({});
  const participantsRef = useRef<Participant[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  const {
    setParticipants, setIsCurrentUserHost,
    setLocalStream, setRemoteStream,
    isVideoOff, isMuted, localStream
  } = useMeetingStore();

  const publishLocalMediaState = useCallback((audioOn: boolean, cameraOn: boolean) => {
    const participants = useMeetingStore.getState().participants.map((participant) => (
      participant.isMe
        ? { ...participant, isMuted: !audioOn, isVideoOff: !cameraOn }
        : participant
    ));

    useMeetingStore.setState({
      isMuted: !audioOn,
      isVideoOff: !cameraOn,
      participants
    });
    useMeetingStore.getState().sendWebSocketEvent({
      event: 'STATE_UPDATE',
      audio_on: audioOn,
      camera_on: cameraOn
    });
  }, []);

  const markRemoteMediaAvailable = useCallback((attendeeIdForStream: string, stream: MediaStream) => {
    const hasAudio = stream.getAudioTracks().some((track) => track.readyState === 'live');
    const hasVideo = stream.getVideoTracks().some((track) => track.readyState === 'live');

    useMeetingStore.setState((state) => ({
      participants: state.participants.map((participant) => (
        participant.id === attendeeIdForStream
          ? {
              ...participant,
              isMuted: hasAudio ? false : participant.isMuted,
              isVideoOff: hasVideo ? false : participant.isVideoOff
            }
          : participant
      ))
    }));
  }, []);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const registerCall = useCallback((peerId: string, attendeeIdForStream: string, call: MediaConnection) => {
    call.on('stream', (remoteStream) => {
      markRemoteMediaAvailable(attendeeIdForStream, remoteStream);
      useMeetingStore.getState().setRemoteStream(attendeeIdForStream, remoteStream);
    });
    call.on('close', () => {
      if (callsRef.current[peerId] === call) {
        delete callsRef.current[peerId];
      }
    });
    call.on('error', (err) => {
      console.error('PeerJS call error:', err);
      if (callsRef.current[peerId] === call) {
        delete callsRef.current[peerId];
      }
    });

    callsRef.current[peerId] = call;
  }, [markRemoteMediaAvailable]);

  const callParticipant = useCallback((
    peer: Peer,
    peerId: string,
    remoteAttendeeId: string,
    stream: MediaStream | null,
    forceReconnect = false
  ) => {
    const existingCall = callsRef.current[peerId];
    if (existingCall && !forceReconnect) return;

    if (existingCall) {
      existingCall.close();
      delete callsRef.current[peerId];
    }

    const call = peer.call(peerId, getCallableStream(stream), {
      metadata: { fromAttendeeId: attendeeId } satisfies CallMetadata
    });

    if (call) {
      registerCall(peerId, remoteAttendeeId, call);
    }
  }, [attendeeId, registerCall]);

  const callKnownParticipants = useCallback((stream: MediaStream | null, forceReconnect = false) => {
    const peer = peerRef.current;
    if (!peer) return;

    participantsRef.current.forEach((participant) => {
      if (participant.isMe || !participant.peerId) return;
      callParticipant(peer, participant.peerId, participant.id, stream, forceReconnect);
    });
  }, [callParticipant]);

  // Handle setting up camera/microphone based on toggles.
  useEffect(() => {
    if (!enabled) return;

    const setupCamera = async () => {
      if (isVideoOff && isMuted) return;

      const currentStream = localStreamRef.current;
      const needsVideo = !isVideoOff && (!currentStream || currentStream.getVideoTracks().length === 0);
      const needsAudio = !isMuted && (!currentStream || currentStream.getAudioTracks().length === 0);

      if (!needsVideo && !needsAudio) return;

      const reusableTracks = currentStream
        ?.getTracks()
        .filter((track) => track.readyState === 'live') ?? [];
      const tracks: MediaStreamTrack[] = [];
      let audioOn = !isMuted;
      let cameraOn = !isVideoOff;

      try {
        if (!isMuted) {
          const existingAudioTrack = reusableTracks.find((track) => track.kind === 'audio');

          if (existingAudioTrack) {
            tracks.push(existingAudioTrack);
          } else {
            try {
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              tracks.push(...audioStream.getAudioTracks());
            } catch (err) {
              console.warn('Microphone unavailable or permission denied:', err);
              audioOn = false;
            }
          }
        }

        if (!isVideoOff) {
          const existingVideoTrack = reusableTracks.find((track) => track.kind === 'video');

          if (existingVideoTrack) {
            tracks.push(existingVideoTrack);
          } else {
            try {
              const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
              tracks.push(...videoStream.getVideoTracks());
            } catch (err) {
              console.warn('Camera unavailable or permission denied:', err);
              cameraOn = false;
            }
          }
        }

        const stream = new MediaStream(tracks);
        stream.getVideoTracks().forEach((track) => { track.enabled = !isVideoOff; });
        stream.getAudioTracks().forEach((track) => { track.enabled = !isMuted; });

        currentStream?.getTracks().forEach((track) => {
          if (!tracks.includes(track)) {
            track.stop();
          }
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        publishLocalMediaState(audioOn, cameraOn);

        // Calls made while muted/video-off carry no useful tracks, so refresh them.
        callKnownParticipants(stream, true);
      } catch (err) {
        console.error('Error setting up local media:', err);
        publishLocalMediaState(false, false);
      }
    };

    setupCamera();
  }, [enabled, isVideoOff, isMuted, setLocalStream, callKnownParticipants, publishLocalMediaState]);

  // Handle WebSocket and PeerJS connection.
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      if (!mounted) return;

      console.log('My peer ID is: ' + id);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.hostname}:8000`;

      const storedUserId = (() => {
        const stored = localStorage.getItem('zoom-dashboard-storage');
        if (!stored) return attendeeId;

        try {
          return JSON.parse(stored).state.userId || attendeeId;
        } catch {
          return attendeeId;
        }
      })();

      const metadataWsUrl = `${wsHost}/ws/meeting/${meetingId}/${attendeeId}?name=${encodeURIComponent(displayName)}&user_id=${storedUserId}`;
      const metadataWs = new WebSocket(metadataWsUrl);
      metadataWsRef.current = metadataWs;

      metadataWs.onopen = () => {
        console.log('Metadata WebSocket connected');
        metadataWs.send(JSON.stringify({
          event: 'USER_JOINED',
          peerId: id
        }));
        metadataWs.send(JSON.stringify({
          event: 'STATE_UPDATE',
          audio_on: !useMeetingStore.getState().isMuted,
          camera_on: !useMeetingStore.getState().isVideoOff
        }));
      };

      metadataWs.onmessage = async (event) => {
        const message = JSON.parse(event.data) as MeetingMessage;
        console.log('WebSocket received:', message);

        if (message.original_host_id) {
          useMeetingStore.getState().setOriginalHostId(message.original_host_id);
        }

        if (message.event === 'END_MEETING') {
          alert("The host has ended this meeting.");
          window.location.href = '/';
          return;
        }

        if (message.attendees) {
          const existingParticipants = useMeetingStore.getState().participants;
          const participantList: Participant[] = [];
          let currentUserHost = false;

          for (const [aId, attendee] of Object.entries(message.attendees)) {
            const existingParticipant = existingParticipants.find((p) => p.id === aId);

            if (aId === attendeeId && attendee.is_host) {
              currentUserHost = true;
            }

            participantList.push({
              id: aId,
              name: attendee.display_name,
              initial: attendee.display_name.charAt(0).toUpperCase(),
              color: existingParticipant?.color ?? 'bg-blue-500',
              isHost: attendee.is_host,
              isMe: aId === attendeeId,
              isMuted: !attendee.audio_on,
              isVideoOff: !attendee.camera_on,
              isPinned: existingParticipant?.isPinned ?? false,
              isSpotlighted: existingParticipant?.isSpotlighted ?? false,
              peerId: attendee.peer_id || undefined
            });
          }

          participantsRef.current = participantList;
          setParticipants(participantList);
          setIsCurrentUserHost(currentUserHost);
          callKnownParticipants(localStreamRef.current, false);
        }

        if (message.event === 'USER_JOINED' && typeof message.attendee_id === 'string' && message.attendee_id !== attendeeId && message.peerId) {
          callParticipant(peer, message.peerId, message.attendee_id, localStreamRef.current, false);
        }
      };

      useMeetingStore.setState({
        sendWebSocketEvent: (payload: any) => {
          console.log('sendWebSocketEvent called with:', payload, 'ReadyState:', metadataWs.readyState);
          if (metadataWs.readyState === WebSocket.OPEN) {
            metadataWs.send(JSON.stringify(payload));
          }
        }
      });
    });

    peer.on('call', (call) => {
      console.log('Receiving call from:', call.peer);
      const metadata = call.metadata as CallMetadata | undefined;
      const callerAttendeeId = metadata?.fromAttendeeId;

      call.answer(getCallableStream(localStreamRef.current));

      const attendeeIdForStream = callerAttendeeId
        ?? useMeetingStore.getState().participants.find((participant) => participant.peerId === call.peer)?.id;

      if (attendeeIdForStream) {
        registerCall(call.peer, attendeeIdForStream, call);
      } else {
        call.on('stream', (remoteStream) => {
          const caller = useMeetingStore.getState().participants.find((participant) => participant.peerId === call.peer);
          if (caller) {
            markRemoteMediaAvailable(caller.id, remoteStream);
            setRemoteStream(caller.id, remoteStream);
          } else {
            console.error('Could not find caller by peer ID:', call.peer);
          }
        });
        callsRef.current[call.peer] = call;
      }
    });

    return () => {
      mounted = false;
      peer.destroy();
      metadataWsRef.current?.close();
      Object.values(callsRef.current).forEach((call) => call.close());
      callsRef.current = {};
      useMeetingStore.setState({ sendWebSocketEvent: () => {} });
    };
  }, [
    enabled,
    meetingId,
    attendeeId,
    displayName,
    setParticipants,
    setIsCurrentUserHost,
    setRemoteStream,
    callKnownParticipants,
    callParticipant,
    registerCall,
    markRemoteMediaAvailable
  ]);
}
