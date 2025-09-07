import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { setSocket, setConnected, addTranscript, addParticipant, removeParticipant } from '../store/slices/websocketSlice';
import { updateMeetingStatus } from '../store/slices/meetingSlice';
import toast from 'react-hot-toast';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5001';
    
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.setupEventListeners();
    store.dispatch(setSocket(this.socket));

    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      store.dispatch(setConnected(true));
      toast.success('Connected to meeting server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      store.dispatch(setConnected(false));
      toast.error('Disconnected from meeting server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      store.dispatch(setConnected(false));
      toast.error('Failed to connect to meeting server');
    });

    // Meeting events
    this.socket.on('meeting:joined', (data) => {
      console.log('Joined meeting:', data.meetingId);
      toast.success('Joined meeting successfully');
    });

    this.socket.on('meeting:started', (data) => {
      store.dispatch(updateMeetingStatus({ id: data.meetingId, status: 'active' }));
      toast.success('Meeting started');
    });

    this.socket.on('meeting:ended', (data) => {
      store.dispatch(updateMeetingStatus({ id: data.meetingId, status: 'ended' }));
      toast.success('Meeting ended');
    });

    // Participant events
    this.socket.on('participant:joined', (data) => {
      store.dispatch(addParticipant({
        userId: data.userId,
        displayName: data.displayName,
      }));
      toast.success(`${data.displayName} joined the meeting`);
    });

    this.socket.on('participant:left', (data) => {
      store.dispatch(removeParticipant(data.userId));
      toast(`${data.displayName} left the meeting`);
    });

    // Caption events (Week 1 fake captions)
    this.socket.on('caption:received', (data) => {
      const transcript = {
        id: `${data.speakerId}-${Date.now()}`,
        meetingId: (store.getState().websocket as any).currentMeetingId || '',
        speakerId: data.speakerId,
        speakerName: data.speakerName,
        content: data.text,
        confidence: data.confidence,
        startTime: 0, // Will be calculated properly in Week 2
        endTime: 0,
        createdAt: data.timestamp,
      };
      
      store.dispatch(addTranscript(transcript));
    });

    // WebRTC signaling events
    this.socket.on('webrtc:offer', (data) => {
      // Handle WebRTC offer (will be implemented with WebRTC component)
      console.log('Received WebRTC offer:', data);
    });

    this.socket.on('webrtc:answer', (data) => {
      // Handle WebRTC answer
      console.log('Received WebRTC answer:', data);
    });

    this.socket.on('webrtc:ice-candidate', (data) => {
      // Handle ICE candidate
      console.log('Received ICE candidate:', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data);
      toast.error(data.message || 'WebSocket error occurred');
    });
  }

  // Meeting actions
  joinMeeting(meetingId: string) {
    this.socket?.emit('meeting:join', { meetingId });
  }

  leaveMeeting(meetingId: string) {
    this.socket?.emit('meeting:leave', { meetingId });
  }

  // Audio streaming (Week 1: fake captions, Week 2: real audio)
  sendAudioStream(meetingId: string, audioData: ArrayBuffer) {
    this.socket?.emit('audio:stream', {
      meetingId,
      audioData: Array.from(new Uint8Array(audioData)),
      timestamp: new Date().toISOString(),
    });
  }

  // Send fake caption for Week 1 demo
  sendFakeCaption(meetingId: string, text: string) {
    this.socket?.emit('caption:send', {
      meetingId,
      text,
      timestamp: new Date().toISOString(),
    });
  }

  // Send real transcription for Week 2
  sendTranscription(meetingId: string, text: string) {
    this.socket?.emit('transcription:send', {
      meetingId,
      text,
      timestamp: new Date().toISOString(),
    });
  }

  // WebRTC signaling
  sendWebRTCOffer(meetingId: string, targetUserId: string, offer: RTCSessionDescriptionInit) {
    this.socket?.emit('webrtc:offer', { meetingId, targetUserId, offer });
  }

  sendWebRTCAnswer(meetingId: string, targetUserId: string, answer: RTCSessionDescriptionInit) {
    this.socket?.emit('webrtc:answer', { meetingId, targetUserId, answer });
  }

  sendICECandidate(meetingId: string, targetUserId: string, candidate: RTCIceCandidateInit) {
    this.socket?.emit('webrtc:ice-candidate', { meetingId, targetUserId, candidate });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setSocket(null));
      store.dispatch(setConnected(false));
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
