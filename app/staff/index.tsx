import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
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
import { useGetStaffQuery } from '@/services/api/staffApi';
import { formatRole } from '@/utils/format';

const roleColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  LIBRARIAN: 'info',
  ACCOUNTANT: 'success',
  SECURITY: 'warning',
  CLEANER: 'info',
  MANAGER: 'error',
  ASSISTANT: 'default',
};

export default function StaffScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
    refetch: refetchStaff,
  } = useGetStaffQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      name: searchQuery || undefined,
      page: 1,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const staff = staffData?.data || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStaffItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/staff/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <Card style={styles.staffCard}>
        <View style={styles.staffRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {getInitials(item.name)}
            </Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={[styles.staffName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
              {item.name}
            </Text>
            <Text style={[styles.staffEmail, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              {item.email}
            </Text>
            <Text style={[styles.staffMobile, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              {item.mobile}
            </Text>
          </View>
          <Badge
            label={item.role}
            variant={roleColors[item.role] || 'info'}
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
          Staff
        </Text>
        <TouchableOpacity onPress={() => router.push('/staff/create' as any)}>
          <Icon name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search staff..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {staffLoading ? (
        <LoadingSpinner />
      ) : staffError ? (
        <EmptyState
          icon="error-outline"
          title="Error loading staff"
          message="Please try again later"
        />
      ) : (
        <FlatList
          data={staff}
          renderItem={renderStaffItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetchStaff}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="people"
              title="No staff found"
              message="Add your first staff member to get started"
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
  list: {
    padding: 16,
    paddingTop: 0,
  },
  staffCard: {
    marginBottom: 12,
    padding: 16,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  staffEmail: {
    marginBottom: 2,
  },
  staffMobile: {
    marginTop: 2,
  },
});

