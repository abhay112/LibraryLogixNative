import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CommonStyles } from '@/constants/CommonStyles';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  fallbackRoute?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  onBackPress,
  fallbackRoute,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        // Navigate to appropriate default route
        const defaultRoute = fallbackRoute || (user?.role === 'admin' ? '/admin/' : '/student/');
        router.replace(defaultRoute);
      }
    }
  };
  
  return (
    <View style={[CommonStyles.header, { borderBottomColor: theme.colors.border }]}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
      <Text style={[CommonStyles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
        {title}
      </Text>
      {rightComponent || <View style={{ width: 24 }} />}
    </View>
  );
};

