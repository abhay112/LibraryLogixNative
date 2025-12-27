import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
}) => {
  const { theme } = useTheme();
  const bgColor = iconColor || theme.colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.md,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textSecondary, ...theme.typography.body },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.value,
              { color: theme.colors.textPrimary, ...theme.typography.h2 },
            ]}
          >
            {value}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary, ...theme.typography.caption },
              ]}
            >
              {subtitle}
            </Text>
          )}
          {trend && (
            <View style={styles.trend}>
              <Text
                style={[
                  styles.trendText,
                  {
                    color: trend.isPositive
                      ? theme.colors.success
                      : theme.colors.error,
                    ...theme.typography.caption,
                  },
                ]}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon name={icon} size={20} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    width: '47%',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textSection: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  value: {
    marginBottom: 4,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
  },
  trend: {
    marginTop: 8,
  },
  trendText: {
    fontWeight: '600',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

