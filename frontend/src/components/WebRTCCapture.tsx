import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import websocketService from '../services/websocket';
import { audioStreamingService, TranscriptionResult } from '../services/audioStreaming';
import { audioStreamingFallbackService } from '../services/audioStreamingFallback';
import { webSpeechAPIService } from '../services/webSpeechAPI';
import { MicOff, VideoOff, AlertCircle, Brain } from 'lucide-react';

interface WebRTCCaptureProps {
  meetingId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onTranscriptUpdate?: (transcripts: any[]) => void;
}

const WebRTCCapture: React.FC<WebRTCCaptureProps> = ({ 
  meetingId, 
  isAudioEnabled, 
  isVideoEnabled,
  onTranscriptUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [currentInterim, setCurrentInterim] = useState<string>('');
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  // Initialize media capture
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setHasPermissions(true);
        setPermissionError(null);
        setIsCapturing(true);
      } catch (error) {
        console.error('Failed to get media permissions:', error);
        setPermissionError('Camera and microphone access required for meetings');
        setHasPermissions(false);
      }
    };

    initializeMedia();

    return () => {
      // Cleanup media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle audio/video toggle
  useEffect(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isAudioEnabled;
      });
    }
  }, [isAudioEnabled]);

  useEffect(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoEnabled;
      });
    }
  }, [isVideoEnabled]);

  // Real audio streaming for Week 2
  useEffect(() => {
    if (!isCapturing || !isAudioEnabled || !streamRef.current) {
      console.log('Audio streaming conditions not met:', { isCapturing, isAudioEnabled, hasStream: !!streamRef.current });
      return;
    }

    console.log('Starting audio streaming for meeting:', meetingId);

    const handleTranscription = (result: TranscriptionResult) => {
      console.log('Received transcription:', result);
      
      // Handle interim results for immediate display
      if (result.confidence < 0.85) {
        setCurrentInterim(result.text);
      } else {
        console.log('Processing final transcription result:', result);
        // Final result - add to transcriptions and clear interim
        const transcriptSegment = {
          id: `${Date.now()}-${Math.random()}`,
          meetingId,
          speakerName: user?.firstName + ' ' + user?.lastName || 'Unknown',
          content: result.text,
          confidence: result.confidence,
          startTime: Date.now(),
          endTime: Date.now(),
          createdAt: new Date().toISOString()
        };
        
        setTranscriptions(prev => {
          const updated = [...prev, transcriptSegment];
          // Call parent callback with updated transcriptions
          if (onTranscriptUpdate) {
            onTranscriptUpdate(updated);
          }
          return updated;
        });
        setCurrentInterim('');
        setFullTranscript(prev => prev + ' ' + result.text);
        // Send transcription via websocket for real-time updates
        websocketService.sendTranscription(meetingId, result.text);
      }
    };

    const handleError = (error: string) => {
      console.error('Transcription error:', error);
    };

    // Start transcription - try free Web Speech API first, then fallback to audio streaming
    setIsTranscribing(true);
    
    const startTranscription = async () => {
      // Try Web Speech API first (free, browser-based)
      if (webSpeechAPIService.isSupported()) {
        console.log('Using free Web Speech API for transcription');
        const success = webSpeechAPIService.startListening(
          handleTranscription,
          (error) => {
            console.log('Web Speech API failed, trying audio streaming:', error);
            startAudioStreaming();
          }
        );
        
        if (success) return;
      }
      
      // Fallback to audio streaming (requires OpenAI API key)
      startAudioStreaming();
    };

    const startAudioStreaming = async () => {
      try {
        await audioStreamingService.startStreaming(
          streamRef.current!,
          meetingId,
          user?.id,
          handleTranscription,
          handleError
        );
      } catch (error) {
        console.log('MediaRecorder failed, trying Web Audio API fallback:', error);
        audioStreamingFallbackService.startStreaming(
          streamRef.current!,
          meetingId,
          user?.id,
          handleTranscription,
          handleError
        );
      }
    };

    startTranscription();

    return () => {
      console.log('Stopping transcription services');
      webSpeechAPIService.stopListening();
      audioStreamingService.stopStreaming();
      audioStreamingFallbackService.stopStreaming();
      setIsTranscribing(false);
    };
  }, [meetingId, isCapturing, isAudioEnabled, user?.id]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setHasPermissions(true);
      setPermissionError(null);
      setIsCapturing(true);
    } catch (error) {
      setPermissionError('Please allow camera and microphone access to join the meeting');
    }
  };

  if (!hasPermissions) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Media Access Required</h3>
          <p className="text-gray-400 mb-6">
            {permissionError || 'Please allow camera and microphone access to join the meeting'}
          </p>
          <button onClick={requestPermissions} className="btn-primary">
            Grant Permissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Main video area */}
      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Video overlay */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {user?.firstName} {user?.lastName} (You)
            </span>
            {!isAudioEnabled && <MicOff className="w-4 h-4 text-red-400" />}
            {!isVideoEnabled && <VideoOff className="w-4 h-4 text-red-400" />}
          </div>
        </div>

        {/* Meeting status overlay */}
        <div className="absolute top-4 right-4">
          <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isCapturing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium capitalize">
                {isCapturing ? 'Recording' : 'Stopped'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Status indicator */}
        {isTranscribing && (
          <div className="absolute top-4 left-4">
            <div className="bg-primary-600 bg-opacity-90 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">AI Transcribing</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Transcription Overlay */}
      {(transcriptions.length > 0 || currentInterim) && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg max-h-32 overflow-y-auto pointer-events-none">
          <div className="text-sm">
            {transcriptions.slice(-3).map((transcription, index) => (
              <div key={index} className="mb-1">
                <span className="text-blue-300 text-xs">
                  {transcription.createdAt ? new Date(transcription.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                </span>
                <span className="ml-2">{transcription.content || transcription.text}</span>
              </div>
            ))}
            {/* Show interim results in real-time */}
            {currentInterim && (
              <div className="mb-1 opacity-75">
                <span className="text-yellow-300 text-xs">Live:</span>
                <span className="ml-2 italic">{currentInterim}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default WebRTCCapture;
