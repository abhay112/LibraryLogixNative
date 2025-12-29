import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetVisitorsQuery, useMarkVisitorExitMutation, useGetVisitorAnalyticsQuery } from '@/services/api/visitorsApi';
import { formatRole } from '@/utils/format';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  ACTIVE: 'success',
  EXITED: 'info',
  EXPIRED: 'error',
};

export default function VisitorsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    data: visitorsData,
    isLoading: visitorsLoading,
    error: visitorsError,
    refetch: refetchVisitors,
  } = useGetVisitorsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      name: searchQuery || undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      page: 1,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const [markExit, { isLoading: exiting }] = useMarkVisitorExitMutation();

  // Fetch visitor analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useGetVisitorAnalyticsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const visitors = visitorsData?.data || [];
  const analytics = analyticsData?.data;

  const handleExit = async (visitorId: string) => {
    try {
      await markExit(visitorId).unwrap();
      Alert.alert('Success', 'Visitor marked as exited');
      refetchVisitors();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to mark exit');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.visitorCard}>
      <View style={styles.visitorRow}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Icon name="person" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.visitorInfo}>
          <Text style={[styles.visitorName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
            {item.name}
          </Text>
          <Text style={[styles.visitorMobile, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
            {item.mobile}
          </Text>
          {item.email && (
            <Text style={[styles.visitorEmail, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              {item.email}
            </Text>
          )}
          <Text style={[styles.visitorPurpose, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
            Purpose: {item.purpose}
          </Text>
          {item.entryTime && (
            <Text style={[styles.visitorTime, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Entry: {format(new Date(item.entryTime), 'MMM dd, HH:mm')}
            </Text>
          )}
        </View>
        <View style={styles.visitorActions}>
          <Badge
            label={item.status}
            variant={statusColors[item.status] || 'info'}
            size="small"
          />
          {item.status === 'ACTIVE' && (
            <Button
              title="Exit"
              onPress={() => handleExit(item._id)}
              variant="secondary"
              size="small"
              loading={exiting}
              style={styles.exitButton}
            />
          )}
        </View>
      </View>
    </Card>
  );

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
          Visitors
        </Text>
        <TouchableOpacity onPress={() => router.push('/visitors/create' as any)}>
          <Icon name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search visitors..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Analytics Summary */}
      {analytics && (
        <View style={styles.analyticsContainer}>
          <Card style={styles.analyticsCard}>
            <Text style={[styles.analyticsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Visitor Analytics
            </Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={[styles.analyticsValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                  {analytics.totalVisitors || 0}
                </Text>
                <Text style={[styles.analyticsLabel, { color: theme.colors.textSecondary }]}>Total</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={[styles.analyticsValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                  {analytics.activeVisitors || 0}
                </Text>
                <Text style={[styles.analyticsLabel, { color: theme.colors.textSecondary }]}>Active</Text>
              </View>
              <View style={styles.analyticsItem}>
                <Text style={[styles.analyticsValue, { color: theme.colors.info, ...theme.typography.h2 }]}>
                  {analytics.exitedVisitors || 0}
                </Text>
                <Text style={[styles.analyticsLabel, { color: theme.colors.textSecondary }]}>Exited</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filters}>
        {['all', 'ACTIVE', 'EXITED', 'EXPIRED'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              {
                backgroundColor: filterStatus === status ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filterStatus === status ? '#FFFFFF' : theme.colors.textPrimary },
              ]}
            >
              {status === 'all' ? 'All' : status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {visitorsLoading ? (
        <LoadingSpinner />
      ) : visitorsError ? (
        <EmptyState
          icon="error-outline"
          title="Error loading visitors"
          message="Please try again later"
        />
      ) : (
        <FlatList
          data={visitors}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetchVisitors}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="people"
              title="No visitors found"
              message="Register your first visitor to get started"
            />
          }
        />
      )}
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
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  visitorCard: {
    marginBottom: 12,
    padding: 16,
  },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  visitorMobile: {
    marginTop: 2,
  },
  visitorEmail: {
    marginTop: 2,
  },
  visitorPurpose: {
    marginTop: 4,
  },
  visitorTime: {
    marginTop: 4,
  },
  visitorActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  exitButton: {
    minWidth: 80,
  },
  analyticsContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  analyticsCard: {
    padding: 16,
  },
  analyticsTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsValue: {
    marginBottom: 4,
    fontWeight: '700',
  },
  analyticsLabel: {
    fontSize: 12,
  },
});

