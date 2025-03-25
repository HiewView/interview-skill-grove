// Speech synthesis and recognition utilities

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Speech recognition with proper TypeScript declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// Configure speech recognition if available
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

// API URL for backend Whisper integration
const WHISPER_API_URL = "http://127.0.0.1:5000/transcribe";

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
    start: (
      onResult: (transcript: string, isFinal: boolean) => void, 
      onSilence?: () => void, 
      silenceThreshold: number = 1500,
      useWhisper: boolean = false
    ) => {
      if (useWhisper) {
        return speechUtils.recognition.startWhisperRecognition(onResult, onSilence, silenceThreshold);
      } else if (recognition) {
        return speechUtils.recognition.startBrowserRecognition(onResult, onSilence, silenceThreshold);
      }
      return null;
    },
    
    // Start browser-based speech recognition
    startBrowserRecognition: (
      onResult: (transcript: string, isFinal: boolean) => void, 
      onSilence?: () => void, 
      silenceThreshold: number = 1500
    ) => {
      if (!recognition) return null;
      
      let lastSpeechTimestamp = Date.now();
      let silenceTimer: number | null = null;
      let transcript = '';
      let isSpeaking = false;
      
      // Clear previous event listeners
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      
      // Set up event listeners
      recognition.onresult = (event: any) => {
        isSpeaking = true;
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
        
        // Update the full transcript - maintain previous transcript for continuous recording
        if (finalTranscript) {
          transcript += ' ' + finalTranscript;
        }
        
        // Call the result handler
        onResult(finalTranscript ? transcript.trim() : interimTranscript, !!finalTranscript);
      };
      
      recognition.onend = () => {
        // Restart recognition if it ends unexpectedly
        recognition.start();
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
      
      // Start the speech recognition
      recognition.start();
      
      // Set up enhanced silence detection
      if (onSilence) {
        const checkSilence = () => {
          const now = Date.now();
          if (now - lastSpeechTimestamp > silenceThreshold && isSpeaking && transcript.trim()) {
            // Silence detected with non-empty transcript and after speech
            onSilence();
            transcript = ''; // Reset transcript after sending
            isSpeaking = false; // Reset speaking flag
          }
          
          silenceTimer = window.setTimeout(checkSilence, 300); // Check more frequently
        };
        
        silenceTimer = window.setTimeout(checkSilence, 300);
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
    
    // Start Whisper-based speech recognition
    startWhisperRecognition: (
      onResult: (transcript: string, isFinal: boolean) => void, 
      onSilence?: () => void, 
      silenceThreshold: number = 1500
    ) => {
      let mediaRecorder: MediaRecorder | null = null;
      let audioChunks: Blob[] = [];
      let silenceTimer: number | null = null;
      let lastSpeechTimestamp = Date.now();
      let isRecording = false;
      let hasSpeech = false; // Flag to track if speech has been detected
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup audio analyzer for silence detection
      const setupSilenceDetection = async (stream: MediaStream) => {
        const audioSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        audioSource.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const checkAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          
          // Calculate average volume level
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // If audio level is above threshold, update timestamp and set hasSpeech flag
          if (average > 10) { // Adjust threshold as needed
            lastSpeechTimestamp = Date.now();
            hasSpeech = true; // Mark that we've detected speech
          } else {
            // Check for silence but only after speech has been detected
            const now = Date.now();
            if (now - lastSpeechTimestamp > silenceThreshold && hasSpeech && isRecording) {
              // Silence detected after speech, stop recording and process audio
              if (mediaRecorder && mediaRecorder.state === 'recording') {
                console.log("Silence detected - stopping recording");
                mediaRecorder.stop();
                isRecording = false;
                hasSpeech = false; // Reset speech flag
              }
            }
          }
          
          if (isRecording) {
            silenceTimer = window.setTimeout(checkAudioLevel, 100);
          }
        };
        
        silenceTimer = window.setTimeout(checkAudioLevel, 100);
      };
      
      // Start recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorder = new MediaRecorder(stream);
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = async () => {
            // Only process if we have audio data
            if (audioChunks.length > 0) {
              // Notify with interim transcript while processing
              onResult("Processing your speech...", false);
              
              // Create audio blob from chunks
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              
              // Send to Whisper API
              const formData = new FormData();
              formData.append('audio', audioBlob);
              
              try {
                const response = await fetch(WHISPER_API_URL, {
                  method: 'POST',
                  body: formData
                });
                
                const data = await response.json();
                
                if (data.transcript) {
                  onResult(data.transcript, true);
                  
                  // Call silence callback if provided
                  if (onSilence) {
                    onSilence();
                  }
                }
              } catch (error) {
                console.error('Error transcribing audio with Whisper:', error);
                onResult("Error transcribing audio", true);
              }
              
              // Reset audio chunks for next recording
              audioChunks = [];
              
              // Start recording again
              if (mediaRecorder) {
                mediaRecorder.start();
                isRecording = true;
              }
            }
          };
          
          // Start recording
          mediaRecorder.start();
          isRecording = true;
          
          // Setup silence detection
          setupSilenceDetection(stream);
          
          // Interim feedback
          onResult("Listening...", false);
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          onResult("Error accessing microphone", true);
        });
      
      // Return control functions
      return {
        stop: () => {
          if (silenceTimer) {
            clearTimeout(silenceTimer);
          }
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            isRecording = false;
          }
          audioContext.close();
        },
        abort: () => {
          if (silenceTimer) {
            clearTimeout(silenceTimer);
          }
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            isRecording = false;
          }
          audioChunks = [];
          audioContext.close();
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
