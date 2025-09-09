import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('AuthContext: Initializing auth...');
      const storedToken = authService.getToken();
      console.log('AuthContext: Stored token exists:', !!storedToken);
      
      if (storedToken) {
        // Check if token is expired
        const isExpired = authService.isTokenExpired(storedToken);
        console.log('AuthContext: Token expired:', isExpired);
        
        if (isExpired) {
          console.log('AuthContext: Attempting token refresh...');
          // Try to refresh token
          const refreshSuccess = await authService.refreshToken();
          console.log('AuthContext: Refresh success:', refreshSuccess);
          if (!refreshSuccess) {
            console.log('AuthContext: Refresh failed, logging out');
            authService.logout();
            setIsLoading(false);
            return;
          }
        }

        // Get updated token after refresh
        const currentToken = authService.getToken();
        if (currentToken) {
          setToken(currentToken);
          console.log('AuthContext: Token set, fetching current user...');
          
          // Fetch current user
          const currentUser = await authService.getCurrentUser();
          console.log('AuthContext: Current user:', currentUser);
          if (currentUser) {
            setUser(currentUser);
          } else {
            // If can't fetch user, clear tokens
            console.log('AuthContext: Failed to fetch user, logging out');
            authService.logout();
            setToken(null);
          }
        }
      }
    } catch (error) {
      console.error('AuthContext: Error initializing auth:', error);
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting login...');
      const response = await authService.login(credentials);
      console.log('AuthContext: Login response:', response);
      console.log('AuthContext: User roles from login:', response.user?.roles);
      
      if (response.success && response.user && response.token) {
        console.log('AuthContext: Setting user and token');
        setUser(response.user);
        setToken(response.token);
        console.log('AuthContext: User set:', response.user);
        console.log('AuthContext: User roles set:', response.user.roles);
      }
      
      return response;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        errors: ['An unexpected error occurred'],
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting registration with:', userData);
      const response = await authService.register(userData);
      console.log('AuthContext: Registration response:', response);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        console.log('AuthContext: User registered and set:', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        errors: ['An unexpected error occurred'],
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken();
      if (success) {
        const newToken = authService.getToken();
        setToken(newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};