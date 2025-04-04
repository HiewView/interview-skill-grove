
/**
 * Interview-related types
 */

export interface StartInterviewParams {
  session_id: string;
  name: string;
  role: string;
  experience: string;
  resume_text?: string;
  organization_id?: string;
  template_id?: string;
  use_whisper?: boolean;
}

export interface SubmitAnswerParams {
  session_id: string;
  answer: string;
}

export interface InterviewResponse {
  message?: string;
  first_question?: string;
  next_question?: string;
}

export interface OrganizationTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  rules: string;
  questions: string[];
  job_description?: string;
}

export interface Candidate {
  id: string;
  email: string;
  name?: string;
  status: "pending" | "invited" | "completed";
  interview_date?: string;
  template_id: string;
}

export interface ComparisonData {
  template: {
    id: string;
    name: string;
    role: string;
    job_description: string;
  };
  comparison: {
    ranked_candidates: Array<{
      report_id: string;
      rank: number;
      strengths: string[];
      weaknesses: string[];
      recommendation: string;
      overall_score: number;
    }>;
    overall_recommendation: string;
  };
  candidates: Array<{
    report_id: string;
    session_id: string;
    overall_score: number;
    technical_score: number;
    communication_score: number;
    personality_score: number;
  }>;
  candidate_count: number;
}
