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
    // Fix: Properly decoding base64 URL (issues if string not padded)
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) { base64 += '='; }
    const payload = JSON.parse(atob(base64));
    const currentTime = Math.floor(Date.now() / 1000); // seconds since epoch
    // Debug: Uncomment next line to check JWT exp in logs
    // console.log('JWT exp:', payload.exp, ', now:', currentTime, ', expiresIn:', (payload.exp - currentTime), 'seconds');
    return typeof payload.exp === "number" ? (payload.exp < currentTime) : true;
  } catch (error) {
    // If we can't parse it, consider it expired
    return true;
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
      // Only clear if expired
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
