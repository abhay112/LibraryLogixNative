import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from './Input';
import { CommonStyles } from '@/constants/CommonStyles';

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  numberOfLines?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  numberOfLines = 8,
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={CommonStyles.textAreaContainer}>
      {label && (
        <Text style={[CommonStyles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          CommonStyles.textArea,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.sm,
          },
        ]}
      >
        <Input
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={numberOfLines}
          style={CommonStyles.textAreaInput}
        />
      </View>
    </View>
  );
};

