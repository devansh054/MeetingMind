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

class AudioStreamingFallbackService {
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private transcriptionCallback?: (result: TranscriptionResult) => void;
  private errorCallback?: (error: string) => void;
  private audioBuffer: Float32Array[] = [];
  private bufferDuration = 5000; // 5 seconds
  private sampleRate = 16000;

  /**
   * Initialize audio streaming with Web Audio API (fallback for MediaRecorder issues)
   */
  async startStreaming(
    stream: MediaStream,
    meetingId: string,
    speakerId?: string,
    onTranscription?: (result: TranscriptionResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      console.log('AudioStreamingFallbackService: Starting streaming for meeting', meetingId);
      this.transcriptionCallback = onTranscription;
      this.errorCallback = onError;

      // Validate stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in stream');
      }
      
      console.log('Audio tracks found:', audioTracks.length, 'State:', audioTracks[0].readyState);

      // Create AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext created, sample rate:', this.audioContext.sampleRate);

      // Create source from stream
      this.source = this.audioContext.createMediaStreamSource(stream);

      // Create processor for audio data
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        if (!this.isRecording) return;

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Store audio data
        this.audioBuffer.push(new Float32Array(inputData));
        
        // Check if we have enough data (approximately 5 seconds)
        const totalSamples = this.audioBuffer.reduce((sum, buffer) => sum + buffer.length, 0);
        const durationMs = (totalSamples / this.audioContext!.sampleRate) * 1000;
        
        if (durationMs >= this.bufferDuration) {
          this.processAudioBuffer(meetingId, speakerId);
        }
      };

      // Connect nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isRecording = true;
      console.log('Web Audio API streaming started');

    } catch (error) {
      console.error('Failed to start Web Audio API streaming:', error);
      this.errorCallback?.(error instanceof Error ? error.message : 'Failed to start audio streaming');
    }
  }

  /**
   * Process accumulated audio buffer and send for transcription
   */
  private async processAudioBuffer(meetingId: string, speakerId?: string): Promise<void> {
    if (this.audioBuffer.length === 0) return;

    try {
      // Combine all buffers
      const totalLength = this.audioBuffer.reduce((sum, buffer) => sum + buffer.length, 0);
      const combinedBuffer = new Float32Array(totalLength);
      
      let offset = 0;
      for (const buffer of this.audioBuffer) {
        combinedBuffer.set(buffer, offset);
        offset += buffer.length;
      }

      // Convert to WAV format (simplified)
      const wavBuffer = this.floatArrayToWav(combinedBuffer, this.audioContext!.sampleRate);
      
      // Create blob and send for transcription
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      await this.sendAudioForTranscription(audioBlob, meetingId, speakerId);

      // Clear buffer
      this.audioBuffer = [];

    } catch (error) {
      console.error('Error processing audio buffer:', error);
      this.errorCallback?.(`Audio processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert Float32Array to WAV format
   */
  private floatArrayToWav(buffer: Float32Array, sampleRate: number): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }

  /**
   * Send audio blob for transcription
   */
  private async sendAudioForTranscription(audioBlob: Blob, meetingId: string, speakerId?: string): Promise<void> {
    try {
      console.log('Sending audio for transcription, size:', audioBlob.size);
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await aiAPI.transcribe(base64Audio, meetingId);

      console.log('Transcription response:', response);
      this.transcriptionCallback?.(response);

    } catch (error) {
      console.error('Transcription request failed:', error);
      this.errorCallback?.(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop audio streaming
   */
  stopStreaming(): void {
    console.log('Stopping Web Audio API streaming');
    this.isRecording = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioBuffer = [];
  }
}

export const audioStreamingFallbackService = new AudioStreamingFallbackService();
