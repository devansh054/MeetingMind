// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Meeting types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  scheduledStart?: string;
  actualStart?: string;
  actualEnd?: string;
  recordingEnabled: boolean;
  transcriptEnabled: boolean;
  aiInsightsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  participants?: Participant[];
  hostFirstName?: string;
  hostLastName?: string;
  hostEmail?: string;
}

export interface Participant {
  id: string;
  meetingId: string;
  userId?: string;
  displayName: string;
  email?: string;
  role: 'host' | 'participant' | 'observer';
  joinedAt?: string;
  leftAt?: string;
  avatarUrl?: string;
}

// Transcript types
export interface TranscriptSegment {
  id: string;
  meetingId: string;
  speakerId?: string;
  speakerName: string;
  content: string;
  confidence: number;
  startTime: number;
  endTime: number;
  createdAt: string;
}

// AI Insights types
export interface AIInsight {
  id: string;
  meetingId: string;
  type: 'action_item' | 'decision' | 'blocker' | 'summary' | 'sentiment';
  content: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  confidence: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

// WebSocket event types
export interface WebSocketEvents {
  'meeting:joined': { meetingId: string };
  'meeting:started': { meetingId: string; startedAt: string };
  'meeting:ended': { meetingId: string; endedAt: string };
  'participant:joined': { userId: string; displayName: string; timestamp: string };
  'participant:left': { userId: string; displayName: string; timestamp: string };
  'caption:received': {
    speakerId: string;
    speakerName: string;
    text: string;
    timestamp: string;
    confidence: number;
  };
  'audio:received': { userId: string; timestamp: string };
  'webrtc:offer': { fromUserId: string; targetUserId: string; offer: RTCSessionDescriptionInit };
  'webrtc:answer': { fromUserId: string; targetUserId: string; answer: RTCSessionDescriptionInit };
  'webrtc:ice-candidate': { fromUserId: string; targetUserId: string; candidate: RTCIceCandidateInit };
  'error': { message: string };
}

// API Response types
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateMeetingForm {
  title: string;
  description?: string;
  scheduledStart?: string;
  recordingEnabled: boolean;
  transcriptEnabled: boolean;
  aiInsightsEnabled: boolean;
}
