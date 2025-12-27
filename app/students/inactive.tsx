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
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import {
  useGetInactiveStudentsQuery,
  useActivateStudentMutation,
} from '@/services/api/studentsApi';

export default function InactiveStudentsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetInactiveStudentsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      page,
      limit: 20,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const [activateStudent] = useActivateStudentMutation();

  const students = studentsData?.data || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleActivate = async (studentId: string) => {
    Alert.alert(
      'Activate Student',
      'Are you sure you want to activate this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              await activateStudent({ id: studentId }).unwrap();
              Alert.alert('Success', 'Student activated successfully');
              refetchStudents();
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to activate student');
            }
          },
        },
      ]
    );
  };

  const renderStudentItem = ({ item }: { item: any }) => (
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
          {item.lastPauseDate && (
            <Text style={[styles.pauseDate, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Paused: {format(new Date(item.lastPauseDate), 'MMM dd, yyyy')}
            </Text>
          )}
        </View>
        <View style={styles.badges}>
          {item.blocked && (
            <Badge label="Blocked" variant="error" size="small" style={styles.badge} />
          )}
          {item.isPaused && (
            <Badge label="Paused" variant="warning" size="small" style={styles.badge} />
          )}
          {!item.active && !item.blocked && !item.isPaused && (
            <Badge label="Inactive" variant="info" size="small" style={styles.badge} />
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          title="Activate"
          onPress={() => handleActivate(item._id)}
          variant="primary"
          size="small"
          style={styles.activateButton}
        />
        <TouchableOpacity onPress={() => router.push(`/students/${item._id}`)}>
          <Text style={[styles.viewDetails, { color: theme.colors.primary }]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="Inactive Students" />

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
        </View>

        {studentsLoading ? (
          <LoadingSpinner />
        ) : studentsError ? (
          <EmptyState
            icon="error-outline"
            title="Error loading students"
            message="Please try again later"
          />
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            onRefresh={refetchStudents}
            refreshing={false}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No inactive students"
                message="All students are active"
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
  studentCard: {
    marginBottom: 12,
    padding: 16,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  pauseDate: {
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  badge: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  activateButton: {
    flex: 1,
    marginRight: 12,
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600',
  },
});

