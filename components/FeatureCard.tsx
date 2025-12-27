import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FeatureCardProps {
  title: string;
  icon: string;
  iconColor: string;
  onPress?: () => void;
  badge?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  icon,
  iconColor,
  onPress,
  badge = false,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {badge && (
        <View style={styles.badge}>
          <Icon name="diamond" size={8} color="#FFCC00" />
        </View>
      )}
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Icon name={icon} size={32} color={iconColor} />
      </View>
      <Text style={[styles.title, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
    minHeight: 100,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFCC0015',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 13,
  },
});

