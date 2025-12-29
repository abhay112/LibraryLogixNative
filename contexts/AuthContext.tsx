import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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

  // Sync auth state with storage when app comes to foreground
  // This handles cases where baseApi clears storage but context state is out of sync
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated) {
        // Verify storage still has tokens when app becomes active
        verifyAuthState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  // Verify that storage state matches context state
  const verifyAuthState = async () => {
    try {
      const accessToken = await Storage.getItem('accessToken');
      const refreshToken = await Storage.getItem('refreshToken');
      const userData = await Storage.getItem('user');

      // If we think we're authenticated but storage is empty, clear auth
      if (isAuthenticated && (!accessToken || !userData)) {
        console.warn('Auth state mismatch detected, clearing auth');
        await clearAuth();
      }
    } catch (error) {
      console.error('Error verifying auth state:', error);
    }
  };

  // Helper function to extract libraryId from user data
  const extractLibraryId = (userData: any): string | undefined => {
    // If libraryId exists, use it
    if (userData.libraryId) {
      return userData.libraryId;
    }
    // If libraries array exists, extract first library ID
    if (userData.libraries && Array.isArray(userData.libraries) && userData.libraries.length > 0) {
      return userData.libraries[0];
    }
    return undefined;
  };

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await Storage.getItem('user');
      const accessToken = await Storage.getItem('accessToken');
      const refreshToken = await Storage.getItem('refreshToken');

      // If we have tokens, verify they're still valid by attempting to refresh
      // This ensures we don't set authenticated state with expired tokens
      if (refreshToken) {
        // Always try to refresh to verify token validity
        const refreshed = await refreshAuth();
        if (refreshed && userData) {
          // Refresh succeeded, restore user data
          try {
            const parsedUser = JSON.parse(userData);
            console.log('🔍 Loading user from storage:', {
              hasLibraryId: !!parsedUser.libraryId,
              hasLibraries: !!parsedUser.libraries,
              libraries: parsedUser.libraries,
            });
            
            // Ensure user has a role
            if (!parsedUser.role) {
              parsedUser.role = 'student';
            }
            // Extract libraryId if missing
            if (!parsedUser.libraryId) {
              const extractedLibraryId = extractLibraryId(parsedUser);
              console.log('📚 Extracting libraryId:', { extractedLibraryId, parsedUser });
              if (extractedLibraryId) {
                parsedUser.libraryId = extractedLibraryId;
                // Update stored user with libraryId
                await Storage.setItem('user', JSON.stringify(parsedUser));
                console.log('✅ Updated user with libraryId:', parsedUser.libraryId);
              } else {
                console.warn('⚠️ Could not extract libraryId from stored user data');
              }
            }
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            await clearAuth();
          }
        } else {
          // Refresh failed or no user data, clear everything
          await clearAuth();
        }
      } else if (userData && accessToken) {
        // We have access token but no refresh token - this is an edge case
        // Try to use the access token, but it might be expired
        // For better UX, we should still try to verify it
        try {
          const parsedUser = JSON.parse(userData);
          if (!parsedUser.role) {
            parsedUser.role = 'student';
          }
          // Extract libraryId if missing
          if (!parsedUser.libraryId) {
            const extractedLibraryId = extractLibraryId(parsedUser);
            if (extractedLibraryId) {
              parsedUser.libraryId = extractedLibraryId;
              // Update stored user with libraryId
              await Storage.setItem('user', JSON.stringify(parsedUser));
            }
          }
          // Set user but mark as authenticated - if token is expired, API calls will fail
          // and baseApi will handle it, but we should verify here too
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
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
      // Don't clear auth here - let the caller handle it
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

        // Extract libraryId from libraries array or use libraryId directly
        // API returns libraries array for admin, libraryId for students
        const libraryId = userData.libraryId || (userData.libraries && userData.libraries.length > 0 ? userData.libraries[0] : undefined);
        
        console.log('🔐 Login - Extracting libraryId:', {
          hasLibraryId: !!userData.libraryId,
          hasLibraries: !!userData.libraries,
          libraries: userData.libraries,
          extractedLibraryId: libraryId,
          userData: userData,
        });

        // Create user object
        const user: User = {
          _id: userData._id,
          id: userData._id,
          email: userData.email,
          name: userData.name || email.split('@')[0] || 'User',
          role: (userData.role || role || 'student') as UserRole, // Use role from API or fallback to login role or 'student'
          libraryId: libraryId,
          membershipStatus: 'active',
        };
        
        console.log('✅ Created user object:', { userId: user._id, libraryId: user.libraryId, role: user.role });

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

