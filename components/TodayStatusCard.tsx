import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TodayStatusCardProps {
  seatNumber?: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
}

export const TodayStatusCard: React.FC<TodayStatusCardProps> = ({
  seatNumber,
  isCheckedIn,
  checkInTime,
  onCheckIn,
  onCheckOut,
}) => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[theme.colors.primary, '#1E40AF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { ...theme.typography.h3 }]}>Today's Status</Text>
        <View
          style={[
            styles.badgeContainer,
            {
              backgroundColor: isCheckedIn
                ? 'rgba(16, 185, 129, 0.9)'
                : 'rgba(255, 255, 255, 0.2)',
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {isCheckedIn ? '✓ Present' : '○ Absent'}
          </Text>
        </View>
      </View>

      {isCheckedIn && seatNumber ? (
        <View style={styles.checkedInContent}>
          <View style={styles.infoSection}>
            <Text style={[styles.label]}>Assigned Seat</Text>
            <Text style={[styles.seatNumber, { ...theme.typography.h1 }]}>
              Seat {seatNumber}
            </Text>
          </View>
          {checkInTime && (
            <View style={styles.infoSection}>
              <Text style={[styles.label]}>Check-in Time</Text>
              <Text style={[styles.time, { ...theme.typography.bodyLarge }]}>
                {checkInTime}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.checkOutButton}
            onPress={onCheckOut}
            activeOpacity={0.8}
          >
            <Text style={styles.checkOutButtonText}>Check Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.notCheckedInContent}>
          <Text style={styles.message}>You haven't checked in today</Text>
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={onCheckIn}
            activeOpacity={0.8}
          >
            <Text style={styles.checkInButtonText}>Check In Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  checkedInContent: {
    gap: 12,
  },
  infoSection: {
    marginBottom: 8,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  seatNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  time: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkOutButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
  },
  checkOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notCheckedInContent: {
    gap: 12,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  checkInButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
});

