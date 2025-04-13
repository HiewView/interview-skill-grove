
/**
 * Utility for working with speech recognition and synthesis
 */

import { clientSpeechUtils } from './clientSpeechUtils';
import { transcriptionService } from '../services/transcriptionService';

// Speech recognition implementation that uses Whisper API
// We'll use the browser's MediaRecorder API to record audio and send it to Whisper
const recognition = {
  isSupported: () => {
    // Check if MediaRecorder is supported in this browser
    return typeof MediaRecorder !== 'undefined';
  },
  
  start: (
    onResult: (transcript: string, isFinal: boolean) => void,
    onSilence: () => void
  ) => {
    // We're just delegating to the client utils for recording
    // The actual transcription will be handled by the transcriptionService
    const recorder = clientSpeechUtils.recording.start(onSilence);
    
    if (!recorder) {
      console.error('Failed to start recording');
      return {
        stop: () => {},
        abort: () => {}
      };
    }
    
    return {
      stop: () => {
        const audioBlob = recorder.stop();
        if (audioBlob) {
          // Process the audio blob with Whisper
          transcriptionService.transcribeAudio(audioBlob)
            .then(result => {
              if (result.transcript) {
                onResult(result.transcript, true);
              }
            })
            .catch(error => {
              console.error('Error transcribing audio:', error);
              onResult('', true); // Empty transcript on error
            });
        }
      },
      abort: () => recorder.abort()
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
