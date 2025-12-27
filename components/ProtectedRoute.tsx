import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/(auth)/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      return; // Still loading, wait
    }

    if (!isAuthenticated || !user) {
      // Not authenticated, redirect to login
      router.replace(redirectTo);
      return;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // User doesn't have required role, redirect to appropriate screen
        if (user.role === 'admin') {
          router.replace('/(tabs)');
        } else if (user.role === 'student') {
          router.replace('/(tabs)');
        } else {
          router.replace(redirectTo);
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, redirectTo, router, segments]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return null; // Don't render, redirect will happen
    }
  }

  // Authenticated and authorized, render children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

