import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from './Badge';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  isRegistered?: boolean;
  onPress?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  time,
  location,
  isRegistered = false,
  onPress,
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
      <View style={styles.header}>
        <View style={styles.titleSection}>
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
              styles.dateTime,
              { color: theme.colors.textSecondary, ...theme.typography.body },
            ]}
          >
            {date} • {time}
          </Text>
        </View>
        {isRegistered && (
          <Badge label="Registered" variant="success" size="small" />
        )}
      </View>

      <View style={styles.locationRow}>
        <Icon name="location-on" size={16} color={theme.colors.textSecondary} />
        <Text
          style={[
            styles.location,
            { color: theme.colors.textSecondary, ...theme.typography.body },
          ]}
        >
          {location}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.viewButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.viewButtonText}>View Details</Text>
        <Icon name="chevron-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  dateTime: {
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  location: {
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

