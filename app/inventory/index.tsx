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
import { useGetInventoryQuery } from '@/services/api/inventoryApi';
import { formatRole } from '@/utils/format';

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  EQUIPMENT: 'primary',
  FURNITURE: 'success',
  STATIONERY: 'info',
  ELECTRONICS: 'warning',
  BOOKS: 'error',
  OTHER: 'info',
};

const conditionColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  GOOD: 'success',
  NEEDS_REPAIR: 'warning',
  DAMAGED: 'error',
  DISPOSED: 'info',
};

export default function InventoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useGetInventoryQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      category: filterCategory !== 'all' ? filterCategory : undefined,
      condition: filterCondition !== 'all' ? filterCondition : undefined,
      page: 1,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const inventory = inventoryData?.data || [];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/inventory/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <Card style={styles.itemCard}>
        <View style={styles.itemRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="inventory" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemLocation, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              {item.location || 'No location'}
            </Text>
            {item.quantity !== undefined && (
              <Text style={[styles.itemQuantity, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Quantity: {item.quantity}
              </Text>
            )}
          </View>
          <View style={styles.badges}>
            <Badge
              label={item.category}
              variant={categoryColors[item.category] || 'info'}
              size="small"
            />
            <Badge
              label={item.condition}
              variant={conditionColors[item.condition] || 'info'}
              size="small"
            />
          </View>
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
          Inventory
        </Text>
        <TouchableOpacity onPress={() => router.push('/inventory/create' as any)}>
          <Icon name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search inventory..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filters}>
        <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Category:</Text>
        <View style={styles.filterButtons}>
          {['all', 'EQUIPMENT', 'FURNITURE', 'STATIONERY', 'ELECTRONICS', 'BOOKS'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filterCategory === cat ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filterCategory === cat ? '#FFFFFF' : theme.colors.textPrimary },
                ]}
              >
                {cat === 'all' ? 'All' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {inventoryLoading ? (
        <LoadingSpinner />
      ) : inventoryError ? (
        <EmptyState
          icon="error-outline"
          title="Error loading inventory"
          message="Please try again later"
        />
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetchInventory}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="inventory"
              title="No inventory items found"
              message="Add your first inventory item to get started"
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
  itemCard: {
    marginBottom: 12,
    padding: 16,
  },
  itemRow: {
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  itemLocation: {
    marginTop: 2,
  },
  itemQuantity: {
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
});

