
/**
 * Service for audio transcription
 */

import { API_URL } from '../utils/apiUtils';

export const transcriptionService = {
  /**
   * Transcribe audio using Whisper
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
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
      console.error("Error transcribing audio:", error);
      throw error;
    }
  }
};
