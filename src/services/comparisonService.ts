
/**
 * Service for comparing candidates
 */

import { ComparisonData } from '../types/interview';
import { API_URL, getApiHeaders } from '../utils/apiUtils';

export const comparisonService = {
  /**
   * Compare candidates for a specific template
   */
  async compareCandidates(templateId: string): Promise<ComparisonData> {
    try {
      const headers = getApiHeaders();
      
      const response = await fetch(`${API_URL}/interview/compare-candidates/${templateId}`, {
        method: "GET",
        headers,
        credentials: "include"
      });
      
      if (!response.ok) {
        console.error("Compare candidates error:", response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error comparing candidates:", error);
      throw error;
    }
  }
};
