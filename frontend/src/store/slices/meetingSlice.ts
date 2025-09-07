import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Meeting, CreateMeetingForm } from '../../types';
import { meetingAPI } from '../../services/api';

interface MeetingState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MeetingState = {
  meetings: [],
  currentMeeting: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const createMeeting = createAsyncThunk(
  'meeting/create',
  async (meetingData: CreateMeetingForm, { rejectWithValue }) => {
    try {
      const response = await meetingAPI.create(meetingData);
      return response.meeting;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create meeting');
    }
  }
);

export const fetchMeetings = createAsyncThunk(
  'meeting/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await meetingAPI.getUserMeetings();
      return response.meetings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch meetings');
    }
  }
);

export const fetchMeetingById = createAsyncThunk(
  'meeting/fetchById',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const response = await meetingAPI.getById(meetingId);
      return response.meeting;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch meeting');
    }
  }
);

export const startMeeting = createAsyncThunk(
  'meeting/start',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const response = await meetingAPI.start(meetingId);
      return response.meeting;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to start meeting');
    }
  }
);

export const endMeeting = createAsyncThunk(
  'meeting/end',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const response = await meetingAPI.end(meetingId);
      return response.meeting;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to end meeting');
    }
  }
);

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setCurrentMeeting: (state, action: PayloadAction<Meeting | null>) => {
      state.currentMeeting = action.payload;
    },
    updateMeetingStatus: (state, action: PayloadAction<{ id: string; status: Meeting['status'] }>) => {
      const { id, status } = action.payload;
      
      // Update in meetings list
      const meetingIndex = state.meetings.findIndex(m => m.id === id);
      if (meetingIndex !== -1) {
        state.meetings[meetingIndex].status = status;
      }
      
      // Update current meeting if it matches
      if (state.currentMeeting?.id === id) {
        state.currentMeeting.status = status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create meeting
      .addCase(createMeeting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings.unshift(action.payload);
        state.currentMeeting = action.payload;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch meetings
      .addCase(fetchMeetings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch meeting by ID
      .addCase(fetchMeetingById.fulfilled, (state, action) => {
        state.currentMeeting = action.payload;
      })
      // Start meeting
      .addCase(startMeeting.fulfilled, (state, action) => {
        const meeting = action.payload;
        state.currentMeeting = meeting;
        
        const meetingIndex = state.meetings.findIndex(m => m.id === meeting.id);
        if (meetingIndex !== -1) {
          state.meetings[meetingIndex] = meeting;
        }
      })
      // End meeting
      .addCase(endMeeting.fulfilled, (state, action) => {
        const meeting = action.payload;
        state.currentMeeting = meeting;
        
        const meetingIndex = state.meetings.findIndex(m => m.id === meeting.id);
        if (meetingIndex !== -1) {
          state.meetings[meetingIndex] = meeting;
        }
      });
  },
});

export const { setCurrentMeeting, updateMeetingStatus, clearError } = meetingSlice.actions;
export default meetingSlice.reducer;
