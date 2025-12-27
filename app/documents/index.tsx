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
import { format } from 'date-fns';
import { useGetDocumentsQuery } from '@/services/api/documentsApi';
import { formatRole } from '@/utils/format';

export default function DocumentsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');

  const {
    data: documentsData,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useGetDocumentsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      documentType: filterType !== 'all' ? filterType : undefined,
      isVerified: filterVerified !== 'all' ? filterVerified === 'verified' : undefined,
      page: 1,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const documents = documentsData?.data || [];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/documents/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <Card style={styles.docCard}>
        <View style={styles.docRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="description" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.docInfo}>
            <Text style={[styles.docType, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
              {item.documentType || 'Document'}
            </Text>
            {item.expiryDate && (
              <Text style={[styles.docExpiry, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Expires: {format(new Date(item.expiryDate), 'MMM dd, yyyy')}
              </Text>
            )}
            {item.studentId && (
              <Text style={[styles.docOwner, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Student ID: {item.studentId}
              </Text>
            )}
          </View>
          <Badge
            label={item.isVerified ? 'Verified' : 'Pending'}
            variant={item.isVerified ? 'success' : 'warning'}
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
          Documents
        </Text>
        <TouchableOpacity onPress={() => router.push('/documents/create' as any)}>
          <Icon name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search documents..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Type:</Text>
          <View style={styles.filterButtons}>
            {['all', 'ID_PROOF', 'ADDRESS_PROOF', 'EDUCATION_CERTIFICATE'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: filterType === type ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: filterType === type ? '#FFFFFF' : theme.colors.textPrimary },
                  ]}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Status:</Text>
          <View style={styles.filterButtons}>
            {['all', 'verified', 'pending'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: filterVerified === status ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setFilterVerified(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: filterVerified === status ? '#FFFFFF' : theme.colors.textPrimary },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {documentsLoading ? (
        <LoadingSpinner />
      ) : documentsError ? (
        <EmptyState
          icon="error-outline"
          title="Error loading documents"
          message="Please try again later"
        />
      ) : (
        <FlatList
          data={documents}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetchDocuments}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="description"
              title="No documents found"
              message="Add your first document to get started"
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
    gap: 12,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
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
  docCard: {
    marginBottom: 12,
    padding: 16,
  },
  docRow: {
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
  docInfo: {
    flex: 1,
  },
  docType: {
    marginBottom: 4,
    fontWeight: '600',
  },
  docExpiry: {
    marginTop: 2,
  },
  docOwner: {
    marginTop: 2,
  },
});

