
/**
 * Enhanced client-side speech recognition utility
 */

// Speech recognition interface
interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  abort: () => void;
  isListening: boolean;
}

// Define our speech recognition utility
export const clientSpeechRecognition = {
  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  },
  
  /**
   * Create and initialize a speech recognition instance
   */
  create(
    onResult: (result: SpeechRecognitionResult) => void,
    onSilence?: () => void,
    onError?: (error: string) => void,
    options: SpeechRecognitionOptions = {}
  ): SpeechRecognitionController | null {
    // Check if speech recognition is supported
    if (!this.isSupported()) {
      if (onError) {
        onError('Speech recognition is not supported in this browser');
      }
      return null;
    }
    
    // Get the SpeechRecognition constructor
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Create the recognition instance
    const recognition = new SpeechRecognition();
    
    // Configure the recognition
    recognition.continuous = options.continuous !== undefined ? options.continuous : true;
    recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true;
    recognition.lang = options.language || 'en-US';
    recognition.maxAlternatives = options.maxAlternatives || 1;
    
    // Silence detection variables
    let silenceTimer: number | null = null;
    const silenceThreshold = 2000; // 2 seconds
    let lastSpeechTime = Date.now();
    let isRecognizing = false;
    
    // Set up event handlers
    recognition.onstart = () => {
      isRecognizing = true;
      lastSpeechTime = Date.now();
    };
    
    recognition.onresult = (event) => {
      // Reset silence timer on any result
      lastSpeechTime = Date.now();
      if (silenceTimer) {
        window.clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      
      // Process results
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      
      // Send result to callback
      onResult({ transcript, isFinal });
      
      // Start silence detection if this is a final result
      if (isFinal && onSilence) {
        silenceTimer = window.setTimeout(() => {
          if (isRecognizing) {
            onSilence();
          }
        }, silenceThreshold);
      }
    };
    
    recognition.onerror = (event) => {
      if (onError) {
        onError(event.error);
      }
      
      // Some errors like "no-speech" should restart recognition
      if (event.error === 'no-speech') {
        recognition.stop();
        setTimeout(() => {
          if (isRecognizing) {
            recognition.start();
          }
        }, 100);
      }
    };
    
    recognition.onend = () => {
      // Auto-restart if we were still supposed to be recognizing
      if (isRecognizing) {
        recognition.start();
      }
    };
    
    // Create controller object
    const controller: SpeechRecognitionController = {
      start: () => {
        if (!isRecognizing) {
          try {
            recognition.start();
            isRecognizing = true;
          } catch (e) {
            // Sometimes if recognition hasn't fully ended, restarting causes an error
            setTimeout(() => {
              try {
                recognition.start();
                isRecognizing = true;
              } catch (err) {
                if (onError) onError('Failed to start recognition');
              }
            }, 100);
          }
        }
      },
      
      stop: () => {
        isRecognizing = false;
        if (silenceTimer) {
          window.clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      },
      
      abort: () => {
        isRecognizing = false;
        if (silenceTimer) {
          window.clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        try {
          recognition.abort();
        } catch (e) {
          // Ignore errors when aborting
        }
      },
      
      get isListening() {
        return isRecognizing;
      }
    };
    
    return controller;
  }
};

// Text-to-speech functionality from existing speechUtils
const synth = window.speechSynthesis;

// Get available voices
const getVoices = (): SpeechSynthesisVoice[] => {
  return synth.getVoices();
};

// Get a voice by language
const getVoiceByLang = (lang: string): SpeechSynthesisVoice | null => {
  const voices = getVoices();
  
  // Find a voice that includes the language code (e.g. 'en-US')
  const voice = voices.find(voice => voice.lang.includes(lang));
  
  // If no match, return the first voice or null
  return voice || voices[0] || null;
};

// Stop all ongoing speech
const cancel = (): void => {
  if (synth.speaking) {
    synth.cancel();
  }
};

// Speak text
const speak = (text: string, voice: SpeechSynthesisVoice | null, options: { rate?: number; pitch?: number; volume?: number } = {}): { finished: Promise<void> } => {
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice
  if (voice) {
    utterance.voice = voice;
  }
  
  // Set options
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;
  
  // Return a promise that resolves when speech ends
  const finished = new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
  });
  
  // Start speaking
  synth.speak(utterance);
  
  return { finished };
};

// Export speech utils
export const clientSpeechUtils = {
  recognition: clientSpeechRecognition,
  getVoices,
  getVoiceByLang,
  speak,
  cancel
};
