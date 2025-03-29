
/**
 * Service for fetching and managing interview reports
 */

// Base URL for API
const API_URL = "http://127.0.0.1:5000";

export interface ReportMetric {
  name: string;
  value: number;
  color: string;
}

export interface Report {
  _id: string;
  session_id: string;
  user_id: string;
  date: string;
  overall_score: number;
  technical_metrics: ReportMetric[];
  communication_metrics: ReportMetric[];
  personality_metrics: ReportMetric[];
  qa_details?: Array<{
    question: string;
    answer: string;
    assessment: string;
  }>;
  role?: string; // Optional role field
}

export const reportService = {
  /**
   * Get all reports for the current user
   */
  async getReports(): Promise<Report[]> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      // Add auth token if available
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/interview/reports`, {
        method: "GET",
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.reports;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  },
  
  /**
   * Get a single report by ID
   */
  async getReportById(reportId: string): Promise<Report> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      // Add auth token if available
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/interview/reports/${reportId}`, {
        method: "GET",
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.report;
    } catch (error) {
      console.error(`Error fetching report ${reportId}:`, error);
      throw error;
    }
  }
};
