import { aiAPI } from './api';

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
  meetingId: string;
  speakerId?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  speaker_id?: string;
  timestamp: string;
}

class AudioStreamingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private transcriptionCallback?: (result: TranscriptionResult) => void;
  private errorCallback?: (error: string) => void;
  private chunkInterval = 5000; // Send audio chunks every 5 seconds
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  /**
   * Initialize audio streaming with MediaRecorder
   */
  async startStreaming(
    stream: MediaStream,
    meetingId: string,
    speakerId?: string,
    onTranscription?: (result: TranscriptionResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      console.log('AudioStreamingService: Starting streaming for meeting', meetingId);
      this.transcriptionCallback = onTranscription;
      this.errorCallback = onError;

      // Validate stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in stream');
      }
      
      console.log('Audio tracks found:', audioTracks.length, 'State:', audioTracks[0].readyState);

      // Try different MIME types in order of preference
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];

      let selectedType = '';
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedType = type;
          break;
        }
      }

      if (!selectedType) {
        throw new Error('No supported MediaRecorder MIME types found');
      }

      console.log('Using MIME type:', selectedType);
      
      // Create MediaRecorder with minimal options for maximum compatibility
      try {
        this.mediaRecorder = new MediaRecorder(stream);
        console.log('MediaRecorder created without mimeType constraint');
      } catch (error) {
        console.error('Failed to create MediaRecorder without constraints:', error);
        throw new Error(`MediaRecorder creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      this.audioChunks = [];

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available, size:', event.data.size);
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('Audio chunks collected:', this.audioChunks.length, 'Total size:', this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0));
        }
      };

      // Handle stop event - send accumulated audio for transcription
      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0) {
          await this.sendAudioForTranscription(meetingId, speakerId);
          this.audioChunks = [];
        }
      };

      // Add error handler before starting
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.errorCallback?.(`MediaRecorder error: ${event.error?.message || 'Unknown error'}`);
      };

      // Start recording with different approaches
      try {
        // First try with timeslice for regular data events
        this.mediaRecorder.start(1000); // Request data every 1 second
        console.log('MediaRecorder started with 1s timeslice, state:', this.mediaRecorder.state);
      } catch (startError) {
        console.error('Failed to start without timeslice:', startError);
        try {
          // Reset and try with timeslice
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };
          this.mediaRecorder.onstop = async () => {
            if (this.audioChunks.length > 0) {
              await this.sendAudioForTranscription(meetingId, speakerId);
              this.audioChunks = [];
            }
          };
          this.mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            this.errorCallback?.(`MediaRecorder error: ${event.error?.message || 'Unknown error'}`);
          };
          
          this.mediaRecorder.start(5000); // 5 second chunks
          console.log('MediaRecorder started with 5s timeslice, state:', this.mediaRecorder.state);
        } catch (timesliceError) {
          console.error('Failed to start with timeslice:', timesliceError);
          throw new Error('MediaRecorder failed to start with any configuration');
        }
      }
      
      this.isRecording = true;

      // Set up interval to process audio chunks
      this.startChunkProcessing(meetingId, speakerId);

      console.log('Audio streaming started');
    } catch (error) {
      console.error('Failed to start audio streaming:', error);
      this.errorCallback?.(error instanceof Error ? error.message : 'Failed to start audio streaming');
    }
  }

  /**
   * Stop audio streaming
   */
  stopStreaming(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Audio streaming stopped');
    }
  }

  /**
   * Start processing audio chunks at regular intervals
   */
  private startChunkProcessing(meetingId: string, speakerId?: string): void {
    const processChunks = async () => {
      if (this.isRecording && this.mediaRecorder) {
        // Stop current recording to trigger data processing
        this.mediaRecorder.stop();
        
        // Start new recording for next chunk
        if (this.isRecording) {
          this.mediaRecorder.start();
        }
      }
    };

    // Process chunks every 5 seconds
    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval);
        return;
      }
      processChunks();
    }, this.chunkInterval);
  }

  /**
   * Send audio data to AI service for transcription
   */
  private async sendAudioForTranscription(meetingId: string, speakerId?: string): Promise<void> {
    try {
      if (this.audioChunks.length === 0) {
        console.log('No audio chunks to send for transcription');
        return;
      }

      console.log('Sending audio for transcription:', this.audioChunks.length, 'chunks');
      
      // Combine audio chunks into single blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      console.log('Audio blob created, size:', audioBlob.size, 'bytes');
      
      // Convert to base64 for API transmission (handle large arrays properly)
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Process in chunks to avoid stack overflow
      let base64Audio = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        base64Audio += String.fromCharCode(...chunk);
      }
      base64Audio = btoa(base64Audio);

      // Send to AI service
      const response = await aiAPI.transcribe(base64Audio, meetingId);

      // Call transcription callback with result
      if (response && this.transcriptionCallback) {
        this.transcriptionCallback({
          text: response.text,
          confidence: response.confidence,
          speaker_id: response.speaker_id,
          timestamp: response.timestamp
        });
      }

    } catch (error) {
      console.error('Transcription request failed:', error);
      this.errorCallback?.('Transcription failed');
    }
  }

  /**
   * Send audio file for transcription (for file uploads)
   */
  async transcribeFile(
    file: File,
    meetingId: string,
    speakerId?: string
  ): Promise<TranscriptionResult> {
    try {
      // Convert file to base64 for now (can be optimized later)
      const arrayBuffer = await file.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const response = await aiAPI.transcribe(base64Audio, meetingId);

      return {
        text: response.text,
        confidence: response.confidence,
        speaker_id: response.speaker_id,
        timestamp: response.timestamp
      };

    } catch (error) {
      console.error('File transcription failed:', error);
      throw new Error('File transcription failed');
    }
  }

  /**
   * Check if currently recording
   */
  get isActive(): boolean {
    return this.isRecording;
  }
}

export const audioStreamingService = new AudioStreamingService();
export default audioStreamingService;
