import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RootState, AppDispatch } from '../store';
import { createMeeting } from '../store/slices/meetingSlice';
import { CreateMeetingForm } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Mic, Brain, Video, Plus, Globe, Shield, Info } from 'lucide-react';

const CreateMeetingPage: React.FC = () => {
  console.log('🚀 NEW ZOOM-STYLE CreateMeetingPage component loaded!');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.meeting);
  
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState('');
  const [meetingIdType, setMeetingIdType] = useState<'generate' | 'personal'>('generate');
  const [personalMeetingId] = useState('260 059 3090');
  const [passcode, setPasscode] = useState('3uhDmw');
  const [enablePasscode, setEnablePasscode] = useState(true);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [enableContinuousChat, setEnableContinuousChat] = useState(true);
  const [repeatOption, setRepeatOption] = useState('never');
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateMeetingForm>({
    defaultValues: {
      recordingEnabled: true,
      transcriptEnabled: true,
      aiInsightsEnabled: true,
    }
  });

  const addAttendee = () => {
    if (newAttendee.trim() && !attendees.includes(newAttendee.trim())) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee('');
    }
  };

  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a !== email));
  };

  const onSubmit = async (data: CreateMeetingForm) => {
    try {
      const meeting = await dispatch(createMeeting(data)).unwrap();
      toast.success('Meeting created successfully!');
      navigate(`/meetings/${meeting.id}`);
    } catch (error) {
      toast.error(error as string);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white" data-testid="zoom-style-meeting-form">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-300 hover:text-white mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-white">🚀 NEW ZOOM-STYLE MEETING FORM 🚀</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2">
            <form id="meeting-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Meeting Title */}
              <div className="mb-8">
                <input
                  {...register('title', { 
                    required: 'Meeting title is required',
                    minLength: { value: 1, message: 'Title cannot be empty' }
                  })}
                  type="text"
                  className="w-full text-3xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400 focus:placeholder-gray-500"
                  placeholder="Dev K's Zoom Meeting"
                  defaultValue="Dev K's Zoom Meeting"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <input
                    {...register('scheduledStart')}
                    type="date"
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    defaultValue="2025-09-05"
                  />
                  <input
                    type="time"
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    defaultValue="12:30"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    defaultValue="13:00"
                  />
                  <input
                    type="date"
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    defaultValue="2025-09-05"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-4 h-4 text-gray-400" />
                <select className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                  <option>America/Toronto</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>

              {/* Repeat */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Repeat</label>
                <select 
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={repeatOption}
                  onChange={(e) => setRepeatOption(e.target.value)}
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Meeting ID */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Meeting ID</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="meetingId"
                      checked={meetingIdType === 'generate'}
                      onChange={() => setMeetingIdType('generate')}
                      className="mr-2"
                    />
                    <span className="text-white">Generate Automatically</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="meetingId"
                      checked={meetingIdType === 'personal'}
                      onChange={() => setMeetingIdType('personal')}
                      className="mr-2"
                    />
                    <span className="text-white">Personal Meeting ID {personalMeetingId}</span>
                  </label>
                </div>
              </div>

              {/* Attachments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Attachments</label>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white hover:bg-gray-600"
                >
                  <Plus className="w-4 h-4" />
                  Add attachments
                </button>
              </div>

              {/* Meeting Security */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-4">Meeting Security</label>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mic className="w-5 h-5 mr-3 text-blue-400" />
                      <div>
                        <span className="font-medium text-white">Live Transcription</span>
                        <p className="text-sm text-gray-400">Real-time speech-to-text during the meeting</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      {...register('transcriptEnabled')}
                      className="rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="w-5 h-5 mr-3 text-blue-400" />
                      <div>
                        <span className="font-medium text-white">Auto Recording</span>
                        <p className="text-sm text-gray-400">Automatically record the meeting</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      {...register('recordingEnabled')}
                      className="rounded"
                    />
                  </label>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-white">Passcode</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enablePasscode}
                        onChange={(e) => setEnablePasscode(e.target.checked)}
                        className="rounded"
                      />
                      {enablePasscode && (
                        <input
                          type="text"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-20"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 ml-6">
                    Only users who have the invite link or passcode can join the meeting
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-white">Waiting Room</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableWaitingRoom}
                      onChange={(e) => setEnableWaitingRoom(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <p className="text-sm text-gray-400 ml-6">
                    Only users admitted by the host can join the meeting
                  </p>
                </div>
              </div>

              {/* Video Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-4">Video</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="w-16 h-12 bg-gray-600 rounded mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">Host</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="w-16 h-12 bg-gray-600 rounded mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">Participant</p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column - Attendees and Options */}
          <div className="space-y-6">
            {/* Attendees Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Attendees</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newAttendee}
                    onChange={(e) => setNewAttendee(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                  />
                  <button
                    type="button"
                    onClick={addAttendee}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {attendees.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                      <span className="text-white">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeAttendee(email)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Options</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-white">Enable continuous chat</span>
                  <input
                    type="checkbox"
                    checked={enableContinuousChat}
                    onChange={(e) => setEnableContinuousChat(e.target.checked)}
                    className="rounded"
                  />
                </label>
                <p className="text-sm text-gray-400">
                  Allow attendees to chat with each other and the host
                </p>
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-400" />
                AI Features
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                      <span className="font-medium text-white">Auto Recording</span>
                      <p className="text-sm text-gray-400">Automatically record the meeting</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    {...register('recordingEnabled')}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mic className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                      <span className="font-medium text-white">Live Transcription</span>
                      <p className="text-sm text-gray-400">Real-time speech-to-text during the meeting</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    {...register('transcriptEnabled')}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 mr-3 text-blue-400" />
                    <div>
                      <span className="font-medium text-white">AI Insights</span>
                      <p className="text-sm text-gray-400">Generate action items and meeting summaries</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    {...register('aiInsightsEnabled')}
                    className="rounded"
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                form="meeting-form"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Schedule'}
              </button>
              <button
                type="button"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Save as Template
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateMeetingPage;
