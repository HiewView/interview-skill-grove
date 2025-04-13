
import { API_URL, getApiHeaders } from '../utils/apiUtils';

interface StartInterviewParams {
  session_id: string;
  name: string;
  role: string;
  experience: string;
  resume_text?: string;
  organization_id?: string;
  template_id?: string;
  use_whisper?: boolean;
}

interface SubmitAnswerParams {
  session_id: string;
  answer: string;
  question_number?: number;
  question?: string;
  is_last_question?: boolean;
}

export const interviewService = {
  /**
   * Start an interview session
   */
  async startInterview(params: StartInterviewParams) {
    const response = await fetch(`${API_URL}/start_interview`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start interview: ${errorText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Submit answer to a question
   */
  async submitAnswer(params: SubmitAnswerParams) {
    const response = await fetch(`${API_URL}/submit_answer`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit answer: ${errorText}`);
    }
    
    return await response.json();
  },
  
  /**
   * End the interview session
   */
  async endInterview(sessionId: string) {
    const response = await fetch(`${API_URL}/end_interview`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ session_id: sessionId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error ending interview:", errorText);
      throw new Error(`Failed to end interview: ${errorText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string) {
    const response = await fetch(`${API_URL}/templates/${templateId}`, {
      method: "GET",
      headers: getApiHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get template: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.template;
  },
  
  /**
   * Transcribe audio using the backend API (Whisper)
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Use getApiHeaders but remove Content-Type for FormData
    const headers = getApiHeaders();
    delete headers['Content-Type'];
    
    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",
      headers,
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
};
