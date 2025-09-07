import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RootState, AppDispatch } from '../store';
import { createMeeting } from '../store/slices/meetingSlice';
import { CreateMeetingForm } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { X, Mic, Brain, Video, Plus, Globe, Shield, Info, Check } from 'lucide-react';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ isOpen, onClose }) => {
  console.log('🚀 NEW ZOOM-STYLE CreateMeetingModal component loaded!');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.meeting);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [attendees, setAttendees] = useState<{email: string, inviteSent: boolean}[]>([]);
  const [newAttendee, setNewAttendee] = useState('');
  const [meetingIdType, setMeetingIdType] = useState<'generate' | 'personal'>('generate');
  const generatePersonalMeetingId = (userId: string) => {
    // Generate a consistent 9-digit PMI based on user ID
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pmi = Math.abs(hash).toString().padStart(9, '0').slice(0, 9);
    return `${pmi.slice(0, 3)} ${pmi.slice(3, 6)} ${pmi.slice(6, 9)}`;
  };

  const getPersonalMeetingId = () => {
    if (!user?.id) return '000 000 000';
    return generatePersonalMeetingId(user.id);
  };
  const [passcode, setPasscode] = useState('3uhDmw');
  const [enablePasscode, setEnablePasscode] = useState(true);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [enableContinuousChat, setEnableContinuousChat] = useState(true);
  const [repeatOption, setRepeatOption] = useState('never');
  
  const getUserMeetingTitle = () => {
    console.log('User object in modal:', user);
    const firstName = user?.firstName || user?.email?.split('@')[0] || 'User';
    console.log('Using firstName:', firstName);
    return `${firstName}'s Zoom Meeting`;
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreateMeetingForm>({
    defaultValues: {
      recordingEnabled: true,
      transcriptEnabled: true,
      aiInsightsEnabled: true,
    }
  });

  // Update title when user data becomes available
  React.useEffect(() => {
    if (user) {
      setValue('title', getUserMeetingTitle());
    }
  }, [user, setValue]);

  const addAttendee = async () => {
    const email = newAttendee.trim();
    if (email && !attendees.some(a => a.email === email)) {
      // Add attendee with pending invite status
      const newAttendeeObj = { email, inviteSent: false };
      setAttendees([...attendees, newAttendeeObj]);
      setNewAttendee('');
      
      // Send invitation email
      try {
        await sendInvitation(email);
        // Update status to sent
        setAttendees(prev => prev.map(a => 
          a.email === email ? { ...a, inviteSent: true } : a
        ));
        toast.success(`Invitation sent to ${email}`);
      } catch (error) {
        toast.error(`Failed to send invitation to ${email}`);
      }
    }
  };

  const sendInvitation = async (attendeeEmail: string) => {
    try {
      const meetingData = {
        attendeeEmail,
        meetingTitle: getUserMeetingTitle(),
        meetingDate: new Date().toLocaleDateString(),
        meetingTime: new Date().toLocaleTimeString(),
        meetingId: meetingIdType === 'personal' ? getPersonalMeetingId() : 'Auto-generated',
        hostName: user?.firstName || 'Host',
        meetingLink: `${window.location.origin}/meeting/join/${meetingIdType === 'personal' ? getPersonalMeetingId().replace(/\s/g, '') : 'auto-id'}`
      };

      const response = await fetch('http://localhost:5001/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  };

  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a.email !== email));
  };

  const onSubmit = async (data: CreateMeetingForm) => {
    try {
      const meeting = await dispatch(createMeeting(data)).unwrap();
      toast.success('Meeting created successfully!');
      reset();
      onClose();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleClose = () => {
    reset();
    setAttendees([]);
    setNewAttendee('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Schedule a Meeting</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2">
              <form id="meeting-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Meeting Title */}
                <div className="mb-8">
                  <div className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 hover:border-gray-500 focus-within:border-blue-500 transition-colors">
                    <input
                      {...register('title', { 
                        required: 'Meeting title is required',
                        minLength: { value: 1, message: 'Title cannot be empty' }
                      })}
                      type="text"
                      className="w-full text-xl font-semibold bg-transparent border-none outline-none text-white placeholder-gray-400 focus:placeholder-gray-500"
                      placeholder={getUserMeetingTitle()}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <input
                      {...register('scheduledStart')}
                      type="datetime-local"
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      defaultValue={new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16)}
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
                      <span className="text-white">Personal Meeting ID {getPersonalMeetingId()}</span>
                    </label>
                  </div>
                </div>

                {/* Meeting Security */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-4">Security</label>
                  <div className="space-y-4">
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
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column - Attendees and Options */}
            <div className="space-y-6">
              {/* Attendees Section */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Attendees</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newAttendee}
                      onChange={(e) => setNewAttendee(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                    />
                    <button
                      type="button"
                      onClick={addAttendee}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm">{attendee.email}</span>
                          {attendee.inviteSent && (
                            <div className="flex items-center gap-1 text-green-400 text-xs">
                              <Check className="w-3 h-3" />
                              <span>Invite Sent</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttendee(attendee.email)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Features */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-400" />
                  AI Features
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-white text-sm">Auto Recording</span>
                    </div>
                    <input
                      type="checkbox"
                      {...register('recordingEnabled')}
                      className="rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mic className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-white text-sm">Live Transcription</span>
                    </div>
                    <input
                      type="checkbox"
                      {...register('transcriptEnabled')}
                      className="rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="text-white text-sm">AI Insights</span>
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
                  onClick={handleClose}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
