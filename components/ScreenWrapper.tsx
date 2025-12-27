import React from 'react';
import { View, StyleSheet, ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from './DashboardHeader';
import { useRouter } from 'expo-router';
import { CommonStyles } from '@/constants/CommonStyles';

interface ScreenWrapperProps {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  keyboardAvoiding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  showHeader = true,
  title,
  rightComponent,
  style,
  keyboardAvoiding = false,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  // Use mock user for testing if not authenticated
  const displayUser = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'student' as const,
  };

  const content = (
    <View style={[CommonStyles.container, style]}>
      {showHeader && displayUser && (
        <DashboardHeader
          userName={displayUser.name}
          userRole={displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}
          notificationCount={3}
          onNotificationPress={() => router.push('/notifications')}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
      )}
      {children}
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={CommonStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};

