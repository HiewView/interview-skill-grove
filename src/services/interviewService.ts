
/**
 * Service for communicating with the interview backend API
 */

import { StartInterviewParams, SubmitAnswerParams, InterviewResponse } from '../types/interview';
import { API_URL, getApiHeaders, generateSessionId } from '../utils/apiUtils';
import { templateService } from './templateService';
import { candidateService } from './candidateService';
import { comparisonService } from './comparisonService';
import { transcriptionService } from './transcriptionService';

export const interviewService = {
  /**
   * Start a new interview session
   */
  async startInterview(params: StartInterviewParams): Promise<InterviewResponse> {
    try {
      const headers = getApiHeaders();
      
      const response = await fetch(`${API_URL}/start_interview`, {
        method: "POST",
        headers,
        body: JSON.stringify(params),
        credentials: "include"
      });
      
      if (!response.ok) {
        console.error("Start interview error:", response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
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
      const headers = getApiHeaders();
      
      const response = await fetch(`${API_URL}/submit_answer`, {
        method: "POST",
        headers,
        body: JSON.stringify(params),
        credentials: "include"
      });
      
      if (!response.ok) {
        console.error("Submit answer error:", response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  },
  
  /**
   * End the interview session
   */
  async endInterview(sessionId: string): Promise<{ report_id?: string }> {
    try {
      const headers = getApiHeaders();
      
      // Try ending interview without requiring authorization
      // this allows users who aren't logged in to still exit gracefully
      const response = await fetch(`${API_URL}/interview/end_interview`, {
        method: "POST",
        headers,
        body: JSON.stringify({ session_id: sessionId }),
        credentials: "include"
      });
      
      if (response.status === 401) {
        // If unauthorized, we still want to let the user exit
        console.log("Unauthorized to end interview, but allowing exit");
        return { report_id: undefined };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Error ${response.status}: ${response.statusText}`
        }));
        console.error("End interview error data:", errorData);
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error ending interview:", error);
      // Return empty object instead of throwing, to allow graceful exit
      return {};
    }
  },

  // Re-export methods from other services for backward compatibility
  getTemplates: templateService.getTemplates,
  getTemplateById: templateService.getTemplateById,
  createTemplate: templateService.createTemplate,
  addCandidates: candidateService.addCandidates,
  getCandidates: candidateService.getCandidates,
  scheduleCandidateInterviews: candidateService.scheduleCandidateInterviews,
  transcribeAudio: transcriptionService.transcribeAudio,
  compareCandidates: comparisonService.compareCandidates
};

// Re-export for backward compatibility
export { generateSessionId };
