import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AnnouncementCardProps {
  title: string;
  message: string;
  time: string;
  isNew?: boolean;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  title,
  message,
  time,
  isNew = false,
}) => {
  const { theme } = useTheme();

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
      {isNew && (
        <View
          style={[
            styles.newBadge,
            { backgroundColor: theme.colors.error },
          ]}
        >
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      )}
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.accent + '20' },
          ]}
        >
          <Icon name="campaign" size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.textSection}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary, ...theme.typography.bodyLarge },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.message,
              { color: theme.colors.textSecondary, ...theme.typography.body },
            ]}
          >
            {message}
          </Text>
          <Text
            style={[
              styles.time,
              { color: theme.colors.textSecondary, ...theme.typography.caption },
            ]}
          >
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    marginTop: 4,
  },
});

