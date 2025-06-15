
/**
 * Utilities for API calls
 */

// Use proxy in development, direct URL in production
export const API_URL = import.meta.env.DEV ? "/api" : "http://127.0.0.1:5000";

/**
 * Get standard headers for API requests
 */
export const getApiHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  
  return headers;
};

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Check if user is authenticated (always true for now)
 */
export const isAuthenticated = (): boolean => {
  return true;
};

/**
 * Get current user information (mock user for now)
 */
export const getCurrentUser = (): any => {
  return {
    id: "mock-user-123",
    email: "test@example.com",
    name: "Test User",
    user_type: "candidate"
  };
};
