
import { getApiHeaders } from '../utils/apiUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface StartInterviewParams {
  name: string;
  role: string;
  experience: string;
  resume_text?: string;
  resume_file?: File;
}

export interface SubmitAnswerParams {
  session_id: string;
  answer: string;
  question: string;
}

export interface InterviewResponse {
  session_id?: string;
  first_question?: string;
  next_question?: string;
  message?: string;
  is_complete?: boolean;
}

export const interviewService = {
  async startInterview(params: StartInterviewParams): Promise<InterviewResponse> {
    const formData = new FormData();
    formData.append('name', params.name);
    formData.append('role', params.role);
    formData.append('experience', params.experience);
    
    if (params.resume_text) {
      formData.append('resume_text', params.resume_text);
    }
    
    if (params.resume_file) {
      formData.append('resume_file', params.resume_file);
    }

    const headers = getApiHeaders();
    // Remove Content-Type for FormData - browser will set it automatically with boundary
    const formDataHeaders: HeadersInit = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (key !== 'Content-Type') {
        (formDataHeaders as any)[key] = value;
      }
    });

    const response = await fetch(`${API_URL}/interview/start_interview`, {
      method: 'POST',
      headers: formDataHeaders,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to start interview: ${response.statusText}`);
    }

    return response.json();
  },

  async submitAnswer(params: SubmitAnswerParams): Promise<InterviewResponse> {
    const response = await fetch(`${API_URL}/interview/submit_answer`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit answer: ${response.statusText}`);
    }

    return response.json();
  },

  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const headers = getApiHeaders();
    // Remove Content-Type for FormData - browser will set it automatically with boundary
    const formDataHeaders: HeadersInit = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (key !== 'Content-Type') {
        (formDataHeaders as any)[key] = value;
      }
    });

    const response = await fetch(`${API_URL}/interview/transcribe`, {
      method: 'POST',
      headers: formDataHeaders,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to transcribe audio: ${response.statusText}`);
    }

    return response.json();
  },

  async endInterview(sessionId: string): Promise<{ report_id: string; overall_score: number }> {
    const response = await fetch(`${API_URL}/interview/end_interview`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to end interview: ${response.statusText}`);
    }

    return response.json();
  }
};
