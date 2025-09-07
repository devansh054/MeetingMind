export interface TranscriptionResult {
  text: string;
  confidence: number;
  speaker_id?: string;
  timestamp: string;
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

class WebSpeechAPIService {
  private recognition: any | null = null;
  private isListening = false;
  private transcriptionCallback?: (result: TranscriptionResult) => void;
  private errorCallback?: (error: string) => void;

  constructor() {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    // Configure recognition settings for maximum speed
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1; // Faster processing
    
    // Set shorter timeout for faster response
    if ('webkitSpeechRecognition' in window) {
      this.recognition.webkitSpeechRecognitionService = 'webkit';
    }

    // Handle results - show both interim and final results for speed
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Send interim results immediately for real-time feedback
      if (interimTranscript) {
        const interimResult: TranscriptionResult = {
          text: interimTranscript,
          confidence: 0.7, // Lower confidence for interim
          timestamp: new Date().toISOString()
        };
        console.log('Web Speech API interim:', interimResult.text);
        this.transcriptionCallback?.(interimResult);
      }
      
      // Send final results with higher confidence
      if (finalTranscript) {
        const finalResult: TranscriptionResult = {
          text: finalTranscript,
          confidence: 0.95,
          timestamp: new Date().toISOString()
        };
        console.log('Web Speech API final:', finalResult.text);
        this.transcriptionCallback?.(finalResult);
      }
    };

    // Handle errors
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Web Speech API error:', event.error);
      this.errorCallback?.(`Speech recognition error: ${event.error}`);
    };

    // Handle end event
    this.recognition.onend = () => {
      console.log('Web Speech API ended');
      if (this.isListening) {
        // Restart if we're supposed to be listening
        setTimeout(() => {
          if (this.isListening && this.recognition) {
            this.recognition.start();
          }
        }, 100);
      }
    };

    // Handle start event
    this.recognition.onstart = () => {
      console.log('Web Speech API started');
    };
  }

  /**
   * Start speech recognition
   */
  startListening(
    onTranscription?: (result: TranscriptionResult) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      console.error('Web Speech API not supported in this browser');
      onError?.('Web Speech API not supported in this browser');
      return false;
    }

    this.transcriptionCallback = onTranscription;
    this.errorCallback = onError;

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Web Speech API listening started');
      return true;
    } catch (error) {
      console.error('Failed to start Web Speech API:', error);
      onError?.(`Failed to start speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Stop speech recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      console.log('Web Speech API listening stopped');
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  isSupported(): boolean {
    return !!this.recognition;
  }

  /**
   * Get current listening state
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

export const webSpeechAPIService = new WebSpeechAPIService();
