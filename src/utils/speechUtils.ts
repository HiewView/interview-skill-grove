
/**
 * Utility for working with speech recognition and synthesis
 */

// Add proper TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Define the wrapper for the SpeechRecognition API
interface SpeechRecognitionWrapper {
  isSupported: () => boolean;
  start: (
    onResult: (transcript: string, isFinal: boolean) => void,
    onSilence: () => void,
    silenceThreshold?: number,
    useWhisper?: boolean
  ) => { stop: () => void; abort: () => void };
}

// Initialize speech synthesis
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

// Speech recognition implementation
const recognition: SpeechRecognitionWrapper = {
  isSupported: () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  },
  
  start: (onResult, onSilence, silenceThreshold = 2000, useWhisper = true) => {
    // Always use Whisper for recognition
    return startWhisperRecognition(onResult, onSilence, silenceThreshold);
  }
};

// Browser's built-in speech recognition
const startBrowserRecognition = (
  onResult: (transcript: string, isFinal: boolean) => void,
  onSilence: () => void,
  silenceThreshold: number
) => {
  // Get SpeechRecognition constructor
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  // Initialize recognition
  const recognizer = new SpeechRecognition();
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = 'en-US';
  
  // Variables to track silence
  let silenceTimer: number | null = null;
  let lastSpeechTime = Date.now();
  
  // Event handlers
  recognizer.onresult = (event) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript;
    const isFinal = event.results[last].isFinal;
    
    // Update last speech time
    lastSpeechTime = Date.now();
    
    // Clear silence timer
    if (silenceTimer !== null) {
      window.clearTimeout(silenceTimer);
      silenceTimer = null;
    }
    
    // Call result handler
    onResult(transcript, isFinal);
    
    // Start silence detection after speech
    if (isFinal) {
      silenceTimer = window.setTimeout(() => {
        onSilence();
      }, silenceThreshold);
    }
  };
  
  recognizer.onspeechend = () => {
    // Start silence timer
    if (silenceTimer === null) {
      silenceTimer = window.setTimeout(() => {
        onSilence();
      }, silenceThreshold);
    }
  };
  
  recognizer.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };
  
  // Start recognition
  recognizer.start();
  
  // Return control methods
  return {
    stop: () => {
      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
      }
      recognizer.stop();
    },
    abort: () => {
      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
      }
      recognizer.abort();
    }
  };
};

// Whisper-based recognition via server
const startWhisperRecognition = (
  onResult: (transcript: string, isFinal: boolean) => void,
  onSilence: () => void,
  silenceThreshold: number
) => {
  // Check if MediaRecorder is supported
  if (!('MediaRecorder' in window)) {
    console.error('MediaRecorder is not supported in this browser');
    return {
      stop: () => {},
      abort: () => {}
    };
  }
  
  // Set up variables
  let mediaRecorder: MediaRecorder | null = null;
  let silenceTimer: number | null = null;
  let audioChunks: Blob[] = [];
  let isRecording = false;
  let shouldStop = false;
  let lastTranscript = '';
  
  // Get audio stream
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    // Create media recorder
    mediaRecorder = new MediaRecorder(stream);
    
    // Set up event handlers
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstart = () => {
      // Show interim result
      if (lastTranscript) {
        onResult(lastTranscript, false);
      }
    };
    
    mediaRecorder.onstop = async () => {
      if (audioChunks.length === 0 || shouldStop) return;
      
      try {
        // Create audio blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Send to server for transcription
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        // Show that we're processing
        onResult('...', false);
        
        // Call Whisper API
        const response = await fetch('http://127.0.0.1:5000/transcribe', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Only process if we actually got a transcript
        if (data.transcript && data.transcript.trim() !== '') {
          lastTranscript = data.transcript.trim();
          
          // Call the result handler with the transcript
          onResult(lastTranscript, true);
          
          // Start silence timer after successful transcription
          if (silenceTimer !== null) {
            window.clearTimeout(silenceTimer);
          }
          silenceTimer = window.setTimeout(() => {
            onSilence();
          }, 1000); // Shorter timeout after a full transcription
        }
        
        // Start recording again if we should continue
        if (isRecording && !shouldStop) {
          audioChunks = [];
          mediaRecorder?.start(1000); // Record in 1-second chunks
        }
      } catch (error) {
        console.error('Whisper transcription error:', error);
      }
    };
    
    // Start recording
    audioChunks = [];
    mediaRecorder.start(2000); // Record in 2-second chunks
    isRecording = true;
    
    // Set up silence detection
    silenceTimer = window.setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, silenceThreshold);
    
  }).catch(error => {
    console.error('Error accessing microphone:', error);
  });
  
  // Return control methods
  return {
    stop: () => {
      shouldStop = true;
      isRecording = false;
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
      }
    },
    abort: () => {
      shouldStop = true;
      isRecording = false;
      audioChunks = [];
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
      }
    }
  };
};

// Export speech utils
export const speechUtils = {
  getVoices,
  getVoiceByLang,
  speak,
  cancel,
  recognition
};
