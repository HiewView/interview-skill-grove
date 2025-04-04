
/**
 * Service for managing candidates
 */

import { Candidate } from '../types/interview';
import { generateSessionId } from '../utils/apiUtils';

/**
 * Get all candidates from local storage
 */
const getCandidates = (): Candidate[] => {
  const candidates = localStorage.getItem('interview_candidates');
  return candidates ? JSON.parse(candidates) : [];
};

/**
 * Save candidates to local storage
 */
const saveCandidates = (candidates: Candidate[]): void => {
  localStorage.setItem('interview_candidates', JSON.stringify(candidates));
};

/**
 * Candidate service with public methods
 */
export const candidateService = {
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
  }
};
