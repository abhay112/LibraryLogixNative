// admin dashboard
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { FeatureCard } from '@/components/FeatureCard';
import { Card } from '@/components/Card';
import { useGetAdminStatsQuery } from '@/services/api/adminStatsApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatRole } from '@/utils/format';

// Mock data - replace with actual data fetching
const mockUser = { 
  role: 'student' as const, 
  name: 'Abhay',
  email: 'abhay@example.com',
};

// Feature cards matching the reference UI - Admin routes
const featureCards = [
  { title: 'Students', icon: 'person', color: '#5AC8FA', route: '/admin/students' },
  { title: 'Attendance', icon: 'event', color: '#007AFF', route: '/admin/attendance' },
  { title: 'Seats', icon: 'schedule', color: '#FF9500', route: '/admin/seats' },
  { title: 'Fees', icon: 'account-balance-wallet', color: '#34C759', route: '/admin/fees' },
  { title: 'Inquery', icon: 'comment', color: '#007AFF', route: '/queries/submit' },
  { title: 'Inactive Students', icon: 'person-off', color: '#007AFF', route: '/students/inactive' },
];

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Use auth user or fallback to mock
  const displayUser = user || mockUser;

  // Fetch admin stats if user is admin
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetAdminStatsQuery(
    { adminId: user?._id || user?.id || '' },
    { 
      skip: (!user?._id && !user?.id) || user?.role !== 'admin' || authLoading,
      refetchOnMountOrArgChange: true,
    }
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.role === 'admin') {
        await refetchStats();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStats, user?.role]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DashboardHeader
        userName={displayUser.name || 'User'}
        userRole={formatRole(displayUser.role)}
        notificationCount={3}
        onNotificationPress={() => router.push('/notifications')}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Stats Card */}
        {user?.role === 'admin' && (
          <>
            {statsLoading ? (
              <View style={styles.statsContainer}>
                <LoadingSpinner />
              </View>
            ) : statsData?.data ? (
              <>
                {/* Attendance & Fees Stats */}
                <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.statsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                    Overview
                  </Text>
                  <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Text style={[styles.statValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                        {statsData.data.attendance?.presentCount || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Present Today
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.error + '15' }]}>
                      <Text style={[styles.statValue, { color: theme.colors.error, ...theme.typography.h2 }]}>
                        {statsData.data.attendance?.absentCount || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Absent Today
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.info + '15' }]}>
                      <Text style={[styles.statValue, { color: theme.colors.info, ...theme.typography.h2 }]}>
                        {statsData.data.fees?.totalFeesRecords || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Total Fees Records
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.warning + '15' }]}>
                      <Text style={[styles.statValue, { color: theme.colors.warning, ...theme.typography.h2 }]}>
                        {statsData.data.fees?.pendingFees || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Pending Fees
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Gender Stats */}
                <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.statsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                    Gender Distribution
                  </Text>
                  <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#2196F3' + '15' }]}>
                      <Text style={[styles.statValue, { color: '#2196F3', ...theme.typography.h2 }]}>
                        {statsData.data.genderStats?.male || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Male
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#E91E63' + '15' }]}>
                      <Text style={[styles.statValue, { color: '#E91E63', ...theme.typography.h2 }]}>
                        {statsData.data.genderStats?.female || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Female
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.textSecondary + '15' }]}>
                      <Text style={[styles.statValue, { color: theme.colors.textSecondary, ...theme.typography.h2 }]}>
                        {statsData.data.genderStats?.other || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Other
                      </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Text style={[styles.statValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                        {(statsData.data.genderStats?.male || 0) + (statsData.data.genderStats?.female || 0) + (statsData.data.genderStats?.other || 0)}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                        Total Students
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Seat Layout Stats */}
                {statsData.data.seatLayout && (
                  <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.statsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                      Seat Layout
                    </Text>
                    <View style={styles.shiftContainer}>
                      {Object.entries(statsData.data.seatLayout).map(([shift, layoutInfo]: [string, any]) => (
                        <View key={shift} style={[styles.shiftCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                          <Text style={[styles.shiftTitle, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                            {shift.replace('_', ' ')}
                          </Text>
                          <View style={styles.shiftStats}>
                            <View style={styles.shiftStatItem}>
                              <Text style={[styles.shiftStatValue, { color: theme.colors.primary }]}>
                                {layoutInfo.seatLayout?.totalSeats || 0}
                              </Text>
                              <Text style={[styles.shiftStatLabel, { color: theme.colors.textSecondary }]}>Total Seats</Text>
                            </View>
                            <View style={styles.shiftStatItem}>
                              <Text style={[styles.shiftStatValue, { color: theme.colors.success }]}>
                                {layoutInfo.seatLayout?.availableSeats || 0}
                              </Text>
                              <Text style={[styles.shiftStatLabel, { color: theme.colors.textSecondary }]}>Available</Text>
                            </View>
                            <View style={styles.shiftStatItem}>
                              <Text style={[styles.shiftStatValue, { color: theme.colors.warning }]}>
                                {layoutInfo.seatLayout?.fixedSeats || 0}
                              </Text>
                              <Text style={[styles.shiftStatLabel, { color: theme.colors.textSecondary }]}>Fixed</Text>
                            </View>
                            <View style={styles.shiftStatItem}>
                              <Text style={[styles.shiftStatValue, { color: theme.colors.error }]}>
                                {layoutInfo.seatLayout?.blockedSeats || 0}
                              </Text>
                              <Text style={[styles.shiftStatLabel, { color: theme.colors.textSecondary }]}>Blocked</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : null}
          </>
        )}

        {/* Feature Cards Grid */}
        <View style={styles.gridContainer}>
          {featureCards.map((card, index) => (
            <FeatureCard
              key={index}
              title={card.title}
              icon={card.icon}
              iconColor={card.color}
              onPress={() => router.push(card.route as any)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    paddingTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  statsContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  statsTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 8,
    fontWeight: '700',
  },
  statLabel: {
    textAlign: 'center',
  },
  shiftContainer: {
    gap: 12,
  },
  shiftCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  shiftTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  shiftStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  shiftStatItem: {
    alignItems: 'center',
    minWidth: '20%',
  },
  shiftStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  shiftStatLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
