import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CommonStyles } from '@/constants/CommonStyles';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  onBackPress,
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
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

