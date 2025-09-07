import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import meetingReducer from './slices/meetingSlice';
import websocketReducer from './slices/websocketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    meeting: meetingReducer,
    websocket: websocketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['websocket/setSocket'],
        ignoredPaths: ['websocket.socket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
