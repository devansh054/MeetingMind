import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchMeetings } from '../store/slices/meetingSlice';
import { logout } from '../store/slices/authSlice';
import { Meeting } from '../types';
import { Plus, Calendar, Clock, Users, LogOut, Brain } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { meetings, isLoading } = useSelector((state: RootState) => state.meeting);

  useEffect(() => {
    dispatch(fetchMeetings());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">MeetingMind</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.firstName || 'User'}!
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Meetings</p>
                <p className="text-2xl font-semibold text-gray-900">{meetings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Meetings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {meetings.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {meetings.filter(m => {
                    if (!m.createdAt) return false;
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    const createdDate = new Date(m.createdAt);
                    return !isNaN(createdDate.getTime()) && createdDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Meetings</h2>
            <Link to="/meetings/new" className="btn-primary flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
              <p className="text-gray-600 mb-6">Create your first meeting to get started with AI-powered insights.</p>
              <Link to="/meetings/new" className="btn-primary">
                Create Meeting
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900 mr-3">
                          {meeting.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-gray-600 mb-2">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>Created {meeting.createdAt ? format(new Date(meeting.createdAt), 'MMM d, yyyy') : 'Unknown'}</span>
                        {meeting.scheduledStart && (
                          <span>Scheduled for {format(new Date(meeting.scheduledStart), 'MMM d, h:mm a')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/meetings/${meeting.id}`}
                        className="btn-primary text-sm"
                      >
                        {meeting.status === 'active' ? 'Join' : 'View'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
