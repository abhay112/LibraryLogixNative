import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatRole } from '@/utils/format';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useGetSeatLayoutQuery,
} from '@/services/api/seatLayoutApi';

export default function SeatsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Fetch seat layout
  const {
    data: seatLayoutData,
    isLoading: seatLayoutLoading,
    error: seatLayoutError,
    refetch: refetchSeatLayout,
  } = useGetSeatLayoutQuery(
    {
      adminId: user?._id || user?.id,
      libraryId: user?.libraryId,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const seats = seatLayoutData?.seats || [];

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'VACANT':
      case 'BLANK':
        return theme.colors.success;
      case 'FILLED':
        return theme.colors.error;
      case 'FIXED':
        return theme.colors.warning;
      case 'BLOCKED':
        return theme.colors.textSecondary;
      default:
        return theme.colors.border;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VACANT':
        return 'Vacant';
      case 'BLANK':
        return 'Available';
      case 'FILLED':
        return 'Occupied';
      case 'FIXED':
        return 'Fixed';
      case 'BLOCKED':
        return 'Blocked';
      default:
        return status;
    }
  };

  const renderSeatItem = ({ item }: { item: any }) => {
    const seatColor = getSeatColor(item.status);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/seats`)}
        activeOpacity={0.7}
      >
        <Card style={styles.seatCard}>
          <View style={styles.seatHeader}>
            <View style={styles.seatInfo}>
              <Text style={[styles.seatNumber, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {item.seatNumber}
              </Text>
              <Badge
                label={getStatusLabel(item.status)}
                variant={
                  item.status === 'VACANT' || item.status === 'BLANK'
                    ? 'success'
                    : item.status === 'FILLED'
                    ? 'error'
                    : item.status === 'FIXED'
                    ? 'warning'
                    : 'default'
                }
                size="small"
              />
            </View>
            <Icon name="event-seat" size={32} color={seatColor} />
          </View>
          {item.currentAssignment && (
            <View style={styles.studentInfo}>
              <Icon name="person" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.studentName, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Student ID: {item.currentAssignment.studentId}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {user && (
        <DashboardHeader
          userName={user.name}
          userRole={formatRole(user.role)}
          notificationCount={3}
          onNotificationPress={() => router.push('/notifications')}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
      )}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          Seats
        </Text>
        <TouchableOpacity onPress={() => router.push('/seats/layout')}>
          <Icon name="edit" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Available
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Occupied
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Reserved
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Maintenance
            </Text>
          </View>
        </View>

        {seatLayoutLoading ? (
          <LoadingSpinner />
        ) : seatLayoutError ? (
          <EmptyState
            icon="error-outline"
            title="Error loading seats"
            message="Please try again later"
          />
        ) : (
          <View style={styles.seatsList}>
            <FlatList
              data={seats}
              renderItem={renderSeatItem}
              keyExtractor={(item) => item._id || item.seatNumber?.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <EmptyState
                  icon="event-seat"
                  title="No seats found"
                  message="Seat layout not configured"
                />
              }
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontWeight: '500',
  },
  seatsList: {
    padding: 16,
  },
  seatCard: {
    marginBottom: 12,
    padding: 16,
  },
  seatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seatNumber: {
    fontWeight: '700',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  studentName: {
    marginLeft: 4,
  },
});

