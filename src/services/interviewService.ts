/**
 * Service for communicating with the interview backend API
 */

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
}

interface InterviewResponse {
  message?: string;
  first_question?: string;
  next_question?: string;
}

interface OrganizationTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  rules: string;
  questions: string[];
  job_description?: string;
}

interface Candidate {
  id: string;
  email: string;
  name?: string;
  status: "pending" | "invited" | "completed";
  interview_date?: string;
  template_id: string;
}

// Base URL for API - customize this as needed
const API_URL = "http://127.0.0.1:5000";

// For demo purposes, we'll use local storage to simulate organization templates and candidates
const getTemplates = (): OrganizationTemplate[] => {
  const templates = localStorage.getItem('interview_templates');
  return templates ? JSON.parse(templates) : [];
};

const saveTemplate = (template: OrganizationTemplate): void => {
  const templates = getTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem('interview_templates', JSON.stringify(templates));
};

const getCandidates = (): Candidate[] => {
  const candidates = localStorage.getItem('interview_candidates');
  return candidates ? JSON.parse(candidates) : [];
};

const saveCandidates = (candidates: Candidate[]): void => {
  localStorage.setItem('interview_candidates', JSON.stringify(candidates));
};

export const interviewService = {
  /**
   * Start a new interview session
   */
  async startInterview(params: StartInterviewParams): Promise<InterviewResponse> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/start_interview`, {
        method: "POST",
        headers,
        body: JSON.stringify(params),
        credentials: "include"
      });
      
      if (!response.ok) {
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
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/submit_answer`, {
        method: "POST",
        headers,
        body: JSON.stringify(params),
        credentials: "include"
      });
      
      if (!response.ok) {
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
  async endInterview(sessionId: string): Promise<{ report_id: string }> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/interview/end_interview`, {
        method: "POST",
        headers,
        body: JSON.stringify({ session_id: sessionId }),
        credentials: "include"
      });
      
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
      // Return a mock response to help with navigation flow
      return { report_id: `mock-${sessionId}` };
    }
  },

  /**
   * Create or update an interview template
   */
  createTemplate(template: Partial<OrganizationTemplate> & { 
    name: string; 
    role: string; 
    description: string; 
    rules: string; 
    questions: string[];
    job_description?: string;
  }): OrganizationTemplate {
    const newTemplate: OrganizationTemplate = {
      ...template,
      id: template.id || generateSessionId(),
    };
    
    saveTemplate(newTemplate);
    return newTemplate;
  },

  /**
   * Get all interview templates
   */
  getTemplates(): OrganizationTemplate[] {
    return getTemplates();
  },

  /**
   * Get a specific template by ID
   */
  getTemplateById(id: string): OrganizationTemplate | undefined {
    return getTemplates().find(t => t.id === id);
  },

  /**
   * Add candidates for interviews
   */
  addCandidates(candidateEmails: string[], templateId: string): Candidate[] {
    const existingCandidates = getCandidates();
    
    const newCandidates: Candidate[] = candidateEmails.map(email => ({
      id: generateSessionId(),
      email: email.trim(),
      status: "pending",
      template_id: templateId
    }));
    
    const allCandidates = [...existingCandidates, ...newCandidates];
    saveCandidates(allCandidates);
    
    return newCandidates;
  },

  /**
   * Get all candidates
   */
  getCandidates(): Candidate[] {
    return getCandidates();
  },

  /**
   * Schedule interviews for candidates
   */
  scheduleCandidateInterviews(candidateIds: string[], date: string): void {
    const candidates = getCandidates();
    
    candidateIds.forEach(id => {
      const index = candidates.findIndex(c => c.id === id);
      if (index !== -1) {
        candidates[index].status = "invited";
        candidates[index].interview_date = date;
      }
    });
    
    saveCandidates(candidates);
    
    // In a real application, this would trigger emails to candidates
    console.log(`Scheduled interviews for ${candidateIds.length} candidates on ${date}`);
  },

  /**
   * Compare candidates for a specific template
   */
  async compareCandidates(templateId: string): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/interview/compare-candidates/${templateId}`, {
        method: "GET",
        headers,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error comparing candidates:", error);
      
      // Fallback: Return mock data when backend is unavailable
      const template = this.getTemplateById(templateId);
      
      if (!template) {
        throw new Error("Template not found");
      }
      
      return {
        template: {
          id: template.id,
          name: template.name,
          role: template.role,
          job_description: template.job_description || "No job description provided"
        },
        comparison: {
          ranked_candidates: [
            {
              report_id: "mock-report-1",
              rank: 1,
              strengths: ["Strong technical knowledge", "Excellent communication skills"],
              weaknesses: ["Limited experience with certain technologies"],
              recommendation: "Highly recommended for the position",
              overall_score: 92
            },
            {
              report_id: "mock-report-2",
              rank: 2,
              strengths: ["Good problem-solving ability", "Team player"],
              weaknesses: ["Communication could be improved"],
              recommendation: "Good potential but needs mentoring",
              overall_score: 78
            }
          ],
          overall_recommendation: "The first candidate shows stronger potential for this role based on technical skills and communication ability."
        },
        candidates: [
          {
            report_id: "mock-report-1",
            session_id: "mock-session-1",
            overall_score: 92,
            technical_score: 94,
            communication_score: 90,
            personality_score: 88
          },
          {
            report_id: "mock-report-2",
            session_id: "mock-session-2",
            overall_score: 78,
            technical_score: 80,
            communication_score: 75,
            personality_score: 82
          }
        ],
        candidate_count: 2
      };
    }
  },

  /**
   * Transcribe audio using Whisper
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ transcript: string }> {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const headers: HeadersInit = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        headers,
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
      return { transcript: "" };
    }
  }
};

// Generate a unique session ID
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
