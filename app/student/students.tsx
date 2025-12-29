import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
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
import { useGetStudentsQuery } from '@/services/api/studentsApi';


export default function StudentsScreen() {
  const { theme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Fetch students using RTK Query
  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetStudentsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      name: searchQuery || undefined,
      page,
      limit: 20,
    },
    { 
      skip: (!user?._id && !user?.id) || !user?.libraryId || authLoading,
      refetchOnMountOrArgChange: true,
    }
  );

  const students = studentsData?.data || [];
  const isLoading = studentsLoading;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/students/${item._id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.studentCard}>
        <View style={styles.studentRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {getInitials(item.name)}
            </Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={[styles.studentName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
              {item.name}
            </Text>
            <Text style={[styles.studentEmail, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              {item.email}
            </Text>
            {item.mobile && (
              <Text style={[styles.studentMobile, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                {item.mobile}
              </Text>
            )}
          </View>
          <TouchableOpacity>
            <Icon name="more-vert" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
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
          Students
        </Text>
        <TouchableOpacity onPress={() => router.push('/students/create')}>
          <Icon name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search student..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon name="filter-list" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.statsCard}>
          <Text style={[styles.statsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Statistics
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                25
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Total Days
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.success, ...theme.typography.h2 }]}>
                23
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Present
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.error, ...theme.typography.h2 }]}>
                2
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Absent
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: theme.colors.info, ...theme.typography.h2 }]}>
                92%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Percentage
              </Text>
            </View>
          </View>
        </Card>

      {isLoading ? (
        <LoadingSpinner />
      ) : studentsError ? (
        <EmptyState
          icon="error-outline"
          title="Error loading students"
          message="Please try again later"
        />
      ) : (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Students
          </Text>
          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No students found"
                message="Add your first student to get started"
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
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    padding: 20,
  },
  statsTitle: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  studentCard: {
    marginBottom: 12,
    padding: 16,
  },
  studentRow: {
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
  studentInfo: {
    flex: 1,
  },
  studentName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  studentEmail: {
    marginBottom: 2,
  },
  studentMobile: {
    marginTop: 2,
  },
});

