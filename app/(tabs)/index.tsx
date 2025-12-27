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
import { useGetAdminStatsQuery } from '@/services/api/adminStatsApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatRole } from '@/utils/format';

// Mock data - replace with actual data fetching
const mockUser = { 
  role: 'student' as const, 
  name: 'Abhay',
  email: 'abhay@example.com',
};

// Feature cards matching the reference UI
const featureCards = [
  { title: 'Students', icon: 'person', color: '#5AC8FA', route: '/(tabs)/students' },
  { title: 'Attendance', icon: 'event', color: '#007AFF', route: '/(tabs)/attendance' },
  { title: 'Seats', icon: 'schedule', color: '#FF9500', route: '/(tabs)/seats' },
  { title: 'Fees', icon: 'account-balance-wallet', color: '#34C759', route: '/fees' },
  { title: 'Inquery', icon: 'comment', color: '#007AFF', route: '/(tabs)/queries' },
  { title: 'Inactive Students', icon: 'person-off', color: '#007AFF', route: '/(tabs)/attendance' },
];

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Use auth user or fallback to mock
  const displayUser = user || mockUser;

  // Fetch admin stats if user is admin
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetAdminStatsQuery(
    { adminId: user?._id || user?.id || '' },
    { skip: (!user?._id && !user?.id) || user?.role !== 'admin' }
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
        {user?.role === 'admin' && statsData?.data && (
          <View style={styles.statsContainer}>
            <Text style={[styles.statsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                  {statsData.data.totalStudents || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Total Students
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                  {statsData.data.activeStudents || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Active Students
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: theme.colors.info, ...theme.typography.h2 }]}>
                  ₹{statsData.data.feesCollected || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Fees Collected
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: theme.colors.warning, ...theme.typography.h2 }]}>
                  ₹{statsData.data.feesPending || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Fees Pending
                </Text>
              </View>
            </View>
          </View>
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
});
