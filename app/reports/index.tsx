import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetReportsQuery } from '@/services/api/reportsApi';
import type { ReportStatus } from '@/services/api/reportsApi';
import { formatRole } from '@/utils/format';

const statusColors: Record<ReportStatus, 'success' | 'warning' | 'error' | 'info'> = {
  COMPLETED: 'success',
  GENERATING: 'warning',
  PENDING: 'info',
  FAILED: 'error',
};

export default function ReportsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useGetReportsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      status: filterStatus !== 'all' ? filterStatus : undefined,
      reportType: filterType !== 'all' ? filterType : undefined,
      page: 1,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const reports = reportsData?.data || [];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/reports/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <Card style={styles.reportCard}>
        <View style={styles.reportRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="assessment" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={[styles.reportType, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
              {item.reportType.replace('_', ' ')}
            </Text>
            {item.createdAt && (
              <Text style={[styles.reportDate, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                {format(new Date(item.createdAt), 'MMM dd, yyyy')}
              </Text>
            )}
            {item.startDate && item.endDate && (
              <Text style={[styles.reportPeriod, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                {format(new Date(item.startDate), 'MMM dd')} - {format(new Date(item.endDate), 'MMM dd, yyyy')}
              </Text>
            )}
          </View>
          <Badge
            label={item.status}
            variant={statusColors[item.status] || 'info'}
            size="small"
          />
        </View>
      </Card>
    </TouchableOpacity>
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
          Reports
        </Text>
        <TouchableOpacity onPress={() => router.push('/reports/create' as any)}>
          <Icon name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Status:</Text>
        <View style={styles.filterButtons}>
          {(['all', 'PENDING', 'GENERATING', 'COMPLETED', 'FAILED'] as const).map((status) => (
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
      </View>

      {reportsLoading ? (
        <LoadingSpinner />
      ) : reportsError ? (
        <EmptyState
          icon="error-outline"
          title="Error loading reports"
          message="Please try again later"
        />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetchReports}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="assessment"
              title="No reports found"
              message="Create your first report to get started"
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
  filters: {
    padding: 16,
    paddingTop: 0,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  reportCard: {
    marginBottom: 12,
    padding: 16,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    marginBottom: 4,
    fontWeight: '600',
  },
  reportDate: {
    marginTop: 2,
  },
  reportPeriod: {
    marginTop: 2,
  },
});

