
/**
 * Service for audio transcription
 */

import { API_URL } from '../utils/apiUtils';
import { clientSpeechUtils } from '../utils/clientSpeechUtils';

export const transcriptionService = {
  /**
   * Transcribe audio using browser's Speech Recognition API
   * Falls back to Whisper API if browser doesn't support Speech Recognition
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
    // If browser supports speech recognition, we'll use that instead
    if (clientSpeechUtils.recognition.isSupported()) {
      // For blob input, we'll create an audio element and play it
      // This is mainly for backward compatibility with code using this method
      return new Promise((resolve, reject) => {
        try {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          const recognizer = clientSpeechUtils.recognition.create(
            // On result
            (result) => {
              if (result.isFinal) {
                // Clean up
                URL.revokeObjectURL(audioUrl);
                recognizer?.abort();
                
                // Return the transcript
                resolve({ transcript: result.transcript });
              }
            },
            // On silence
            () => {
              // Clean up
              URL.revokeObjectURL(audioUrl);
              recognizer?.abort();
              
              // If we haven't resolved yet, resolve with empty transcript
              resolve({ transcript: '' });
            },
            // On error
            (error) => {
              console.error("Speech recognition error:", error);
              // Fall back to server if speech recognition fails
              this.transcribeWithWhisper(audioBlob)
                .then(resolve)
                .catch(reject);
            }
          );
          
          if (!recognizer) {
            // Fall back to server if speech recognition is not supported
            this.transcribeWithWhisper(audioBlob)
              .then(resolve)
              .catch(reject);
            return;
          }
          
          // Start recognition when audio starts playing
          audio.onplay = () => {
            recognizer.start();
          };
          
          // Start playing audio
          audio.play();
        } catch (error) {
          console.error("Error setting up client transcription:", error);
          // Fall back to server if client-side fails
          this.transcribeWithWhisper(audioBlob)
            .then(resolve)
            .catch(reject);
        }
      });
    }
    
    // Fall back to Whisper API if browser doesn't support Speech Recognition
    return this.transcribeWithWhisper(audioBlob);
  },
  
  /**
   * Transcribe audio using Whisper API (server-side)
   */
  async transcribeWithWhisper(audioBlob: Blob): Promise<{ transcript: string }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Transcription error response:", errorText);
        throw new Error(`Transcription error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error transcribing audio with Whisper:", error);
      throw error;
    }
  }
};
