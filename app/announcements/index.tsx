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
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetAnnouncementsQuery } from '@/services/api/communicationApi';

export default function AnnouncementsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'students' | 'parents'>('all');

  // Fetch announcements using RTK Query
  const {
    data: announcementsData,
    isLoading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useGetAnnouncementsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      isActive: true,
      page: 1,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const announcements = announcementsData?.data || [];
  
  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filter === 'all') return true;
    return announcement.targetAudience.includes(filter) || announcement.targetAudience.includes('all');
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'EMERGENCY':
        return 'error';
      case 'WARNING':
        return 'warning';
      default:
        return 'info';
    }
  };

  const renderAnnouncementItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/announcements/${item._id}` as any)}
      activeOpacity={0.7}
    >
      <Card style={styles.announcementCard}>
        <View style={styles.announcementHeader}>
          <View style={styles.announcementInfo}>
            <Text style={[styles.announcementTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              {item.title}
            </Text>
            {item.createdAt && (
              <View style={styles.announcementMeta}>
                <Icon name="schedule" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.announcementDate, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                </Text>
              </View>
            )}
          </View>
          <Badge
            label={item.priority || 'INFO'}
            variant={getPriorityColor(item.priority)}
            size="small"
          />
        </View>
        <Text
          style={[styles.announcementMessage, { color: theme.colors.textSecondary, ...theme.typography.body }]}
          numberOfLines={3}
        >
          {item.message}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
            Announcements
          </Text>
          <TouchableOpacity onPress={() => router.push('/announcements/create')}>
            <Icon name="add-circle" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

      <View style={styles.filters}>
        {(['all', 'students', 'parents'] as const).map((filterOption) => (
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

      {announcementsLoading ? (
        <LoadingSpinner />
      ) : announcementsError ? (
        <EmptyState
          icon="error-outline"
          title="Error loading announcements"
          message="Please try again later"
        />
      ) : (
        <FlatList
          data={filteredAnnouncements}
          renderItem={renderAnnouncementItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onRefresh={refetchAnnouncements}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState
              icon="campaign"
              title="No announcements found"
              message="No announcements match your current filter"
            />
          }
        />
      )}
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
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  announcementCard: {
    marginBottom: 12,
    padding: 16,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementInfo: {
    flex: 1,
    marginRight: 12,
  },
  announcementTitle: {
    marginBottom: 8,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementDate: {
    marginLeft: 4,
  },
  announcementMessage: {
    lineHeight: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
  },
});

