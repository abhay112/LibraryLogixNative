import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DashboardHeader } from './DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface PageHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton,
  rightComponent,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <DashboardHeader
      userName={user.name}
      userRole={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      notificationCount={3}
      onNotificationPress={() => router.push('/notifications')}
      onProfilePress={() => router.push('/(tabs)/profile')}
    />
  );
};

