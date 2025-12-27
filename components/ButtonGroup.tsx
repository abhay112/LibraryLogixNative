import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CommonStyles } from '@/constants/CommonStyles';

interface ButtonGroupOption {
  value: string;
  label: string;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={CommonStyles.buttonGroup}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            CommonStyles.buttonGroupItem,
            {
              backgroundColor: selectedValue === option.value ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              CommonStyles.buttonGroupText,
              {
                color: selectedValue === option.value ? '#FFFFFF' : theme.colors.textPrimary,
                ...theme.typography.body,
              },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

