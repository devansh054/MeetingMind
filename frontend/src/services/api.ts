import axios, { AxiosResponse } from 'axios';
import { LoginForm, RegisterForm, CreateMeetingForm, Meeting, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginForm): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterForm): Promise<{ user: User; token: string }> => {
    console.log('Registering user with data:', userData);
    const response: AxiosResponse = await api.post('/auth/register', userData);
    console.log('Registration response:', response.data);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response: AxiosResponse = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (updates: Partial<User>): Promise<{ user: User }> => {
    const response: AxiosResponse = await api.put('/auth/profile', updates);
    return response.data;
  },
};

// Meeting API
export const meetingAPI = {
  create: async (meetingData: CreateMeetingForm): Promise<{ meeting: Meeting }> => {
    const response: AxiosResponse = await api.post('/meetings', meetingData);
    return response.data;
  },

  getUserMeetings: async (): Promise<{ meetings: Meeting[] }> => {
    const response: AxiosResponse = await api.get('/meetings');
    return response.data;
  },

  getById: async (id: string): Promise<{ meeting: Meeting }> => {
    const response: AxiosResponse = await api.get(`/meetings/${id}`);
    return response.data;
  },

  update: async (id: string, updates: Partial<Meeting>): Promise<{ meeting: Meeting }> => {
    const response: AxiosResponse = await api.put(`/meetings/${id}`, updates);
    return response.data;
  },

  start: async (id: string): Promise<{ meeting: Meeting }> => {
    const response: AxiosResponse = await api.post(`/meetings/${id}/start`);
    return response.data;
  },

  end: async (id: string): Promise<{ meeting: Meeting }> => {
    const response: AxiosResponse = await api.post(`/meetings/${id}/end`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },

  addParticipant: async (id: string, participant: { displayName: string; email?: string; role?: string }) => {
    const response: AxiosResponse = await api.post(`/meetings/${id}/participants`, participant);
    return response.data;
  },
};

// AI Service API (direct calls to AI service)
export const aiAPI = {
  transcribe: async (audioData: string, meetingId: string) => {
    const response: AxiosResponse = await axios.post(`${import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'}/transcribe`, {
      audio_data: audioData,
      meeting_id: meetingId,
    });
    return response.data;
  },

  extractInsights: async (transcript: string, meetingId: string) => {
    const response: AxiosResponse = await axios.post(`${import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'}/extract-insights`, {
      transcript,
      meeting_id: meetingId,
    });
    return response.data;
  },

  analyzeSentiment: async (text: string, meetingId: string) => {
    const response: AxiosResponse = await axios.post(`${import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'}/analyze-sentiment`, {
      text,
      meeting_id: meetingId,
    });
    return response.data;
  },
};

export default api;
