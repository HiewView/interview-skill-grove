
/**
 * Service for audio transcription using Whisper API
 */

import { API_URL, getApiHeaders } from '../utils/apiUtils';

export const transcriptionService = {
  /**
   * Transcribe audio using Whisper API
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Add auth token to headers
      const headers = getApiHeaders();
      // Remove content-type so browser can set it properly with boundary for multipart/form-data
      delete headers['Content-Type'];
      
      // Send to the backend API
      const response = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        body: formData,
        headers
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
