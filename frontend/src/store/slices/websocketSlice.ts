import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';
import { TranscriptSegment } from '../../types';

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  currentMeetingId: string | null;
  transcripts: TranscriptSegment[];
  participants: Array<{
    userId: string;
    displayName: string;
    isOnline: boolean;
  }>;
}

const initialState: WebSocketState = {
  socket: null,
  isConnected: false,
  currentMeetingId: null,
  transcripts: [],
  participants: [],
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      state.socket = action.payload as any;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setCurrentMeetingId: (state, action: PayloadAction<string | null>) => {
      state.currentMeetingId = action.payload;
      // Clear transcripts when switching meetings
      if (action.payload !== state.currentMeetingId) {
        state.transcripts = [];
        state.participants = [];
      }
    },
    addTranscript: (state, action: PayloadAction<TranscriptSegment>) => {
      state.transcripts.push(action.payload);
    },
    addParticipant: (state, action: PayloadAction<{ userId: string; displayName: string }>) => {
      const existing = state.participants.find(p => p.userId === action.payload.userId);
      if (!existing) {
        state.participants.push({
          ...action.payload,
          isOnline: true,
        });
      } else {
        existing.isOnline = true;
      }
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      const participant = state.participants.find(p => p.userId === action.payload);
      if (participant) {
        participant.isOnline = false;
      }
    },
    clearTranscripts: (state) => {
      state.transcripts = [];
    },
  },
});

export const {
  setSocket,
  setConnected,
  setCurrentMeetingId,
  addTranscript,
  addParticipant,
  removeParticipant,
  clearTranscripts,
} = websocketSlice.actions;

export default websocketSlice.reducer;
