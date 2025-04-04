
/**
 * Utility for working with speech recognition and synthesis
 */

import { clientSpeechUtils } from './clientSpeechUtils';
import { transcriptionService } from '../services/transcriptionService';

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
    silenceThreshold?: number
  ) => { stop: () => void; abort: () => void };
}

// Speech recognition implementation
const recognition: SpeechRecognitionWrapper = {
  isSupported: () => {
    return clientSpeechUtils.recognition.isSupported();
  },
  
  start: (onResult, onSilence, silenceThreshold = 2000) => {
    // Use client-side speech recognition
    const recognizer = clientSpeechUtils.recognition.create(
      // On result
      (result) => {
        onResult(result.transcript, result.isFinal);
      },
      // On silence
      onSilence,
      // On error
      (error) => {
        console.error('Speech recognition error:', error);
      },
      // Options
      {
        continuous: true,
        interimResults: true,
        language: 'en-US'
      }
    );
    
    // If recognizer is not available, fallback to a simple implementation
    if (!recognizer) {
      return {
        stop: () => {},
        abort: () => {}
      };
    }
    
    // Start recognition
    recognizer.start();
    
    // Return control methods
    return {
      stop: () => recognizer.stop(),
      abort: () => recognizer.abort()
    };
  }
};

// Export speech utils
export const speechUtils = {
  getVoices: clientSpeechUtils.getVoices,
  getVoiceByLang: clientSpeechUtils.getVoiceByLang,
  speak: clientSpeechUtils.speak,
  cancel: clientSpeechUtils.cancel,
  recognition
};
