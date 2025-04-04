
/**
 * Utilities for API calls
 */

// Base URL for API - customize this as needed
export const API_URL = "http://127.0.0.1:5000";

/**
 * Get standard headers for API requests
 */
export const getApiHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
