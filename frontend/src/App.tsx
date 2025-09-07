import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import V0SignInPage from './pages/V0SignInPage';
import V0SignUpPage from './pages/V0SignUpPage';
import V0Dashboard from './pages/V0Dashboard';
import V0MeetingInterface from './pages/V0MeetingInterface';
import CreateMeetingPage from './pages/CreateMeetingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { RootState, AppDispatch } from './store';
import { fetchProfile } from './store/slices/authSlice';
import './index.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If we have a token but no user profile, fetch it
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, user]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/signin" element={<V0SignInPage />} />
        <Route path="/signup" element={<V0SignUpPage />} />
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <V0Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting/:id"
          element={
            <ProtectedRoute>
              <V0MeetingInterface />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-meeting"
          element={
            <ProtectedRoute>
              <CreateMeetingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
