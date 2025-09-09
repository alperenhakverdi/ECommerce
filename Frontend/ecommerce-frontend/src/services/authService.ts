import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5133/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        this.setTokens(data.token, data.refreshToken, credentials.rememberMe);
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        errors: ['Unable to connect to server'],
      };
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        this.setTokens(data.token, data.refreshToken);
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        errors: ['Unable to connect to server'],
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();
      
      if (!token || !refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          this.setTokens(data.token, data.refreshToken);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  }

  private setTokens(token: string, refreshToken?: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Clear both storages first
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    
    // Set tokens in appropriate storage
    storage.setItem('token', token);
    if (refreshToken) {
      storage.setItem('refreshToken', refreshToken);
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();