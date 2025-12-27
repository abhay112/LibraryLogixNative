import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { Storage } from '@/utils/storage';
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} from '@/services/api/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'admin' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  useEffect(() => {
    // Load user from storage on mount and verify token
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await Storage.getItem('user');
      const accessToken = await Storage.getItem('accessToken');
      const refreshToken = await Storage.getItem('refreshToken');

      if (userData && accessToken) {
        const parsedUser = JSON.parse(userData);
        // Ensure user has a role
        if (!parsedUser.role) {
          parsedUser.role = 'student';
        }
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else if (refreshToken) {
        // Try to refresh token if we have refresh token but no access token
        const refreshed = await refreshAuth();
        if (!refreshed) {
          // Refresh failed, clear everything
          await clearAuth();
        }
      } else {
        // No tokens, clear everything
        await clearAuth();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const refreshToken = await Storage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const result = await refreshTokenMutation({ refreshToken }).unwrap();
      
      if (result.success && result.data) {
        // Store new access token
        await Storage.setItem('accessToken', result.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const clearAuth = async () => {
    setUser(null);
    setIsAuthenticated(false);
    await Storage.removeItem('user');
    await Storage.removeItem('accessToken');
    await Storage.removeItem('refreshToken');
  };

  const login = async (email: string, password: string, role: 'admin' | 'student') => {
    try {
      setIsLoading(true);
      const result = await loginMutation({ email, password, role }).unwrap();

      if (result.success && result.data) {
        const { accessToken, refreshToken, user: userData } = result.data;

        // Store tokens
        await Storage.setItem('accessToken', accessToken);
        await Storage.setItem('refreshToken', refreshToken);

        // Create user object
        const user: User = {
          _id: userData._id,
          id: userData._id,
          email: userData.email,
          name: userData.name || email.split('@')[0] || 'User',
          role: (userData.role || role || 'student') as UserRole, // Use role from API or fallback to login role or 'student'
          libraryId: userData.libraryId,
          membershipStatus: 'active',
        };

        // Store user data
        await Storage.setItem('user', JSON.stringify(user));

        // Update state
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      await clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const accessToken = await Storage.getItem('accessToken');
      const refreshToken = await Storage.getItem('refreshToken');

      // Call logout API if we have tokens
      if (accessToken && refreshToken) {
        try {
          await logoutMutation({ refreshToken }).unwrap();
        } catch (error) {
          // Even if logout API fails, clear local storage
          console.error('Logout API error:', error);
        }
      }

      // Clear local storage
      await clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if API call fails
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      Storage.setItem('user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, updateUser, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

