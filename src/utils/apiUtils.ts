
/**
 * Utilities for API calls
 */

// Base URL for API - customize this as needed
export const API_URL = "http://127.0.0.1:5000";

/**
 * Check if JWT token is expired
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse it, consider it expired
  }
};

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
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token expired, clearing localStorage');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      // Redirect to login
      window.location.href = '/login';
      return headers;
    }
    
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

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    return false;
  }
  
  return true;
};

/**
 * Get current user information
 */
export const getCurrentUser = (): any => {
  if (!isAuthenticated()) return null;
  
  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};
