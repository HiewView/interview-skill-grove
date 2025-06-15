
import { getApiHeaders } from '../utils/apiUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface StartInterviewParams {
  name: string;
  role: string;
  experience: string;
  [key: string]: any; // Allow other mock interview settings
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
  report_id?: string;
  overall_score?: number;
}

export const interviewService = {
  async startInterview(params: StartInterviewParams): Promise<InterviewResponse> {
    const formData = new FormData();
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (key === 'resume_file' && value instanceof File) {
            formData.append(key, value);
        } else if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(item => formData.append(`${key}[]`, String(item)));
            } else {
                formData.append(key, String(value));
            }
        }
    });

    // We are not using JWT, so we don't need getApiHeaders
    const response = await fetch(`${API_URL}/interview/start_interview`, {
      method: 'POST',
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
      headers: { 'Content-Type': 'application/json' },
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

    const response = await fetch(`${API_URL}/transcribe`, {
      method: 'POST',
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Failed to end interview: ${error.message || response.statusText}`);
    }

    return response.json();
  }
};
