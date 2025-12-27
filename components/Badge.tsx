import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getBackgroundColor = () => {
    const color = getVariantColor();
    return color + '20'; // Add transparency
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          paddingHorizontal: size === 'small' ? theme.spacing.sm : theme.spacing.md,
          paddingVertical: size === 'small' ? 2 : 4,
          borderRadius: theme.borderRadius.sm,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getVariantColor(),
            ...theme.typography.caption,
            fontWeight: '600',
            fontSize: size === 'small' ? 10 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    textTransform: 'uppercase',
  },
});

