
// Speech synthesis and recognition utilities

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// Configure speech recognition if available
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

export const speechUtils = {
  // Speak the given text
  speak: (text: string, voice?: SpeechSynthesisVoice | null, options?: { rate?: number; pitch?: number; volume?: number }) => {
    // Cancel any ongoing speech
    synth.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if provided
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set options if provided
    if (options) {
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;
    }
    
    // Speak the utterance
    synth.speak(utterance);
    
    return {
      // Return a cancel function
      cancel: () => synth.cancel(),
      
      // Return a promise that resolves when speech is done
      finished: new Promise<void>(resolve => {
        utterance.onend = () => resolve();
      })
    };
  },
  
  // Cancel any ongoing speech
  cancel: () => {
    synth.cancel();
  },
  
  // Get all available voices
  getVoices: (): SpeechSynthesisVoice[] => {
    return synth.getVoices();
  },
  
  // Get a specific voice by language
  getVoiceByLang: (lang: string = 'en-US'): SpeechSynthesisVoice | null => {
    const voices = synth.getVoices();
    return voices.find(voice => voice.lang.includes(lang)) || null;
  },

  // Speech recognition utilities
  recognition: {
    // Check if speech recognition is supported
    isSupported: () => !!recognition,
    
    // Start speech recognition
    start: (onResult: (transcript: string, isFinal: boolean) => void, onSilence?: () => void, silenceThreshold: number = 1500) => {
      if (!recognition) return null;
      
      let lastSpeechTimestamp = Date.now();
      let silenceTimer: number | null = null;
      let transcript = '';
      
      // Clear previous event listeners
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      
      // Set up event listeners
      recognition.onresult = (event) => {
        lastSpeechTimestamp = Date.now(); // Update timestamp when speech is detected
        
        // Get the transcript
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Update the full transcript
        transcript = finalTranscript || interimTranscript;
        
        // Call the result handler
        onResult(transcript, !!finalTranscript);
      };
      
      recognition.onend = () => {
        // Restart recognition if it ends
        recognition.start();
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
      
      // Start the speech recognition
      recognition.start();
      
      // Set up silence detection
      if (onSilence) {
        const checkSilence = () => {
          const now = Date.now();
          if (now - lastSpeechTimestamp > silenceThreshold && transcript.trim()) {
            // Silence detected with non-empty transcript
            onSilence();
            transcript = ''; // Reset transcript
          }
          
          silenceTimer = window.setTimeout(checkSilence, 500);
        };
        
        silenceTimer = window.setTimeout(checkSilence, 500);
      }
      
      // Return control functions
      return {
        stop: () => {
          if (silenceTimer) {
            clearTimeout(silenceTimer);
          }
          recognition.stop();
        },
        abort: () => {
          if (silenceTimer) {
            clearTimeout(silenceTimer);
          }
          recognition.abort();
        }
      };
    },
    
    stop: () => {
      if (recognition) {
        recognition.stop();
      }
    },
    
    abort: () => {
      if (recognition) {
        recognition.abort();
      }
    }
  }
};
