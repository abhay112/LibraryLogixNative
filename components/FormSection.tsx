import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CommonStyles } from '@/constants/CommonStyles';

interface FormSectionProps {
  label: string;
  children: React.ReactNode;
  style?: any;
}

export const FormSection: React.FC<FormSectionProps> = ({ label, children, style }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[CommonStyles.section, style]}>
      <Text style={[CommonStyles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
        {label}
      </Text>
      {children}
    </View>
  );
};

