
/**
 * Service for handling authentication with the backend API
 */

const API_URL = "http://127.0.0.1:5000";

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'candidate' | 'org_admin';
  organization?: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  user_type: string;
  organization?: string;
}

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Error ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store token and user info in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  async register(params: RegisterParams): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(params),
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Error ${response.status}: ${response.statusText}`
        }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store token and user info in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  
  /**
   * Sign out the current user
   */
  signOut(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    window.location.href = '/';
  },
  
  /**
   * Check if user is signed in
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
  
  /**
   * Get current user information
   */
  getCurrentUser(): User | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }
};
