import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, header, footer, onPress }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          ...theme.shadows.sm,
        },
        style,
      ]}
    >
      {header && (
        <View style={styles.header}>
          {header}
        </View>
      )}
      <View style={styles.body}>{children}</View>
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
  },
  header: {
    marginBottom: 12,
  },
  body: {
    flex: 1,
  },
  footer: {
    marginTop: 12,
  },
});

