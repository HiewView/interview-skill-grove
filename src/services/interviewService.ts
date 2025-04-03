
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
      const token = localStorage.getItem('auth_token');
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
      const token = localStorage.getItem('auth_token');
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
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      // For ending interview, we won't require authorization
      // because the user might not be logged in yet for candidate interviews
      
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
      throw error;
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

// Generate a unique session ID
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
