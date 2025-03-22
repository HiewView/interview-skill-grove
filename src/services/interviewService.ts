
/**
 * Service for communicating with the interview backend API
 */

interface StartInterviewParams {
  session_id: string;
  name: string;
  role: string;
  experience: string;
  resume_text?: string;
}

interface SubmitAnswerParams {
  session_id: string;
  answer: string;
}

interface InterviewResponse {
  message?: string;
  first_question?: string;
  next_question?: string;
}

// Base URL for API - customize this as needed
const API_URL = "http://127.0.0.1:5000";

export const interviewService = {
  /**
   * Start a new interview session
   */
  async startInterview(params: StartInterviewParams): Promise<InterviewResponse> {
    try {
      const response = await fetch(`${API_URL}/start_interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error starting interview:", error);
      throw error;
    }
  },
  
  /**
   * Submit an answer and get the next question
   */
  async submitAnswer(params: SubmitAnswerParams): Promise<InterviewResponse> {
    try {
      const response = await fetch(`${API_URL}/submit_answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  }
};

// Generate a unique session ID
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
