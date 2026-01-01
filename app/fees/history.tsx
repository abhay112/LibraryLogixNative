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
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetFeesQuery } from '@/services/api/feesApi';

export default function FeesHistoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // Fetch all fees for history
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
      limit: 100, // Get more records for history
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const fees = feesData?.data || [];

  const renderFeeItem = ({ item }: { item: any }) => {
    const statusVariant =
      item.status === 'paid'
        ? 'success'
        : item.status === 'overdue'
        ? 'error'
        : 'warning';

    const feeType = item.fees?.[0]?.type || 'Library Fee';
    const amount = item.amount || item.fees?.[0]?.amount || 0;

    return (
      <Card style={styles.feeCard}>
        <View style={styles.feeHeader}>
          <View style={styles.feeInfo}>
            <Text style={[styles.feeType, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
              {feeType}
            </Text>
            {item.studentName && (
              <Text style={[styles.studentName, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Student: {item.studentName}
              </Text>
            )}
            {item.studentId && (
              <Text style={[styles.studentId, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                ID: {item.studentId}
              </Text>
            )}
          </View>
          <Badge
            label={item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ') : 'Pending'}
            variant={statusVariant}
          />
        </View>
        
        <View style={styles.feeDetails}>
          <View style={styles.feeDetailRow}>
            {item.dueDate && (
              <View style={styles.feeDetailItem}>
                <Icon name="calendar-today" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.feeDetailText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Due: {format(new Date(item.dueDate), 'MMM dd, yyyy')}
                </Text>
              </View>
            )}
            {item.paidDate && (
              <View style={styles.feeDetailItem}>
                <Icon name="check-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.feeDetailText, { color: theme.colors.success, ...theme.typography.caption }]}>
                  Paid: {format(new Date(item.paidDate), 'MMM dd, yyyy')}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.feeAmountRow}>
            <Text style={[styles.feeAmount, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              ₹{amount.toFixed(2)}
            </Text>
            {item.paymentMethod && (
              <Text style={[styles.paymentMethod, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                via {item.paymentMethod}
              </Text>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const totalPaid = fees
    .filter((fee) => fee.status === 'paid')
    .reduce((sum, fee) => sum + (fee.amount || fee.fees?.[0]?.amount || 0), 0);

  const totalPending = fees
    .filter((fee) => fee.status === 'pending' || fee.status === 'overdue')
    .reduce((sum, fee) => sum + (fee.amount || fee.fees?.[0]?.amount || 0), 0);

  return (
    <ScreenWrapper>
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
            Fees History
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={[styles.summaryCard, { backgroundColor: theme.colors.success + '10' }]}>
            <View style={styles.summaryContent}>
              <Icon name="check-circle" size={32} color={theme.colors.success} />
              <View style={styles.summaryText}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Total Paid
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                  ₹{totalPaid.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: theme.colors.warning + '10' }]}>
            <View style={styles.summaryContent}>
              <Icon name="pending" size={32} color={theme.colors.warning} />
              <View style={styles.summaryText}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Total Pending
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.warning, ...theme.typography.h2 }]}>
                  ₹{totalPending.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {(['all', 'paid', 'pending', 'overdue'] as const).map((filterOption) => (
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

        {/* Fees List */}
        <ScrollView style={styles.content}>
          {feesLoading ? (
            <LoadingSpinner />
          ) : feesError ? (
            <EmptyState
              icon="error-outline"
              title="Error loading fees history"
              message="Please try again later"
            />
          ) : (
            <FlatList
              data={fees}
              renderItem={renderFeeItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
              onRefresh={refetchFees}
              refreshing={false}
              ListEmptyComponent={
                <EmptyState
                  icon="payment"
                  title="No fees history"
                  message="No fees match your current filter"
                />
              }
            />
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: '700',
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
    marginBottom: 4,
    fontWeight: '600',
  },
  studentName: {
    marginTop: 4,
  },
  studentId: {
    marginTop: 2,
  },
  feeDetails: {
    marginTop: 8,
  },
  feeDetailRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  feeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feeDetailText: {
    marginLeft: 4,
  },
  feeAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  feeAmount: {
    fontWeight: '700',
  },
  paymentMethod: {
    marginTop: 4,
  },
});

