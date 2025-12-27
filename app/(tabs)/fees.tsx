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
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetFeesQuery } from '@/services/api/feesApi';

export default function FeesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'due_soon'>('all');

  // Fetch fees using RTK Query
  const {
    data: feesData,
    isLoading: feesLoading,
    error: feesError,
    refetch: refetchFees,
  } = useGetFeesQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      status: filter !== 'all' ? filter : undefined,
      page: 1,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const fees = feesData?.data || [];
  
  const filteredFees = fees.filter((fee) => {
    if (filter === 'all') return true;
    return fee.status === filter;
  });

  const totalPending = filteredFees
    .filter((fee) => fee.status === 'pending' || fee.status === 'overdue' || fee.status === 'due_soon')
    .reduce((sum, fee) => sum + (fee.amount || 0), 0);

  const renderFeeItem = ({ item }: { item: any }) => {
    const isOverdue = item.status === 'overdue' && item.dueDate && new Date(item.dueDate) < new Date();
    const statusVariant =
      item.status === 'paid'
        ? 'success'
        : item.status === 'overdue' || isOverdue
        ? 'error'
        : 'warning';

    // Get fee type from fees array or use default
    const feeType = item.fees?.[0]?.type || 'Library Fee';
    const amount = item.amount || item.fees?.[0]?.amount || 0;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/fees/${item._id}/pay`)}
        activeOpacity={0.7}
      >
        <Card style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <View style={styles.feeInfo}>
              <Text style={[styles.feeType, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                {feeType}
              </Text>
              {item.dueDate && (
                <View style={styles.feeMeta}>
                  <Icon name="calendar-today" size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.feeDate, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                    Due: {format(new Date(item.dueDate), 'MMM dd, yyyy')}
                  </Text>
                </View>
              )}
              {item.paidDate && (
                <View style={styles.feeMeta}>
                  <Icon name="check-circle" size={14} color={theme.colors.success} />
                  <Text style={[styles.feeDate, { color: theme.colors.success, ...theme.typography.caption }]}>
                    Paid: {format(new Date(item.paidDate), 'MMM dd, yyyy')}
                  </Text>
                </View>
              )}
            </View>
            <Badge
              label={item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ') : 'Pending'}
              variant={statusVariant}
            />
          </View>
          <View style={styles.feeAmountRow}>
            <Text style={[styles.feeAmount, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
              ${amount.toFixed(2)}
            </Text>
            {item.status !== 'paid' && (
              <Button
                title="Pay Now"
                onPress={() => router.push(`/fees/${item._id}/pay`)}
                variant="primary"
                size="small"
              />
            )}
          </View>
          {item.paymentMethod && (
            <Text style={[styles.paymentMethod, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Paid via {item.paymentMethod}
            </Text>
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
          Fees & Payments
        </Text>
        <TouchableOpacity onPress={() => router.push('/fees/history')}>
          <Icon name="history" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {totalPending > 0 && (
          <Card style={[styles.totalCard, { backgroundColor: theme.colors.warning + '10' }]}>
            <View style={styles.totalRow}>
              <View>
                <Text style={[styles.totalLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                  Total Pending
                </Text>
                <Text style={[styles.totalAmount, { color: theme.colors.warning, ...theme.typography.h1 }]}>
                  ${totalPending.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.totalIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                <Icon name="payment" size={32} color={theme.colors.warning} />
              </View>
            </View>
            <Button
              title="Pay All Pending"
              onPress={() => router.push('/fees/pay-all')}
              variant="primary"
              style={styles.payAllButton}
            />
          </Card>
        )}

        <View style={styles.filters}>
          {(['all', 'pending', 'paid', 'overdue', 'due_soon'] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filter === filterOption ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === filterOption ? '#FFFFFF' : theme.colors.textPrimary,
                    ...theme.typography.body,
                  },
                ]}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {feesLoading ? (
          <LoadingSpinner />
        ) : feesError ? (
          <EmptyState
            icon="error-outline"
            title="Error loading fees"
            message="Please try again later"
          />
        ) : (
          <View style={styles.list}>
            <FlatList
              data={filteredFees}
              renderItem={renderFeeItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              ListEmptyComponent={
                <EmptyState
                  icon="payment"
                  title="No fees found"
                  message="No fees match your current filter"
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
  totalCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    marginBottom: 4,
  },
  totalAmount: {
    fontWeight: '700',
  },
  totalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payAllButton: {
    width: '100%',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
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
    fontWeight: '600',
    fontSize: 12,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  feeCard: {
    marginBottom: 12,
    padding: 16,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feeInfo: {
    flex: 1,
    marginRight: 12,
  },
  feeType: {
    marginBottom: 8,
    fontWeight: '600',
  },
  feeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  feeDate: {
    marginLeft: 4,
  },
  feeAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  feeAmount: {
    fontWeight: '700',
  },
  paymentMethod: {
    marginTop: 8,
  },
});

