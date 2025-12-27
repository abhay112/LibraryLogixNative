import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import {
  useGetSeatLayoutQuery,
  useAssignFixedSeatMutation,
  useUnassignFixedSeatMutation,
} from '@/services/api/seatLayoutApi';
import { useGetStudentsQuery } from '@/services/api/studentsApi';

export default function SeatManagementScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'layout' | 'assignments'>('layout');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch seat layout
  const {
    data: seatLayoutData,
    isLoading: seatLayoutLoading,
    error: seatLayoutError,
    refetch: refetchSeatLayout,
  } = useGetSeatLayoutQuery(
    {
      adminId: user?._id || user?.id,
      libraryId: user?.libraryId,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  // Fetch students for assignment
  const {
    data: studentsData,
    isLoading: studentsLoading,
  } = useGetStudentsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      name: searchQuery || undefined,
      limit: 50,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId || view !== 'assignments' }
  );

  const [assignFixedSeat, { isLoading: assigning }] = useAssignFixedSeatMutation();
  const [unassignFixedSeat, { isLoading: unassigning }] = useUnassignFixedSeatMutation();

  const seats = seatLayoutData?.seats || [];
  const students = studentsData?.data || [];

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'VACANT':
      case 'BLANK':
        return theme.colors.success;
      case 'FILLED':
        return theme.colors.error;
      case 'FIXED':
        return theme.colors.warning;
      case 'BLOCKED':
        return theme.colors.textSecondary;
      default:
        return theme.colors.border;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VACANT':
        return 'Vacant';
      case 'BLANK':
        return 'Available';
      case 'FILLED':
        return 'Occupied';
      case 'FIXED':
        return 'Fixed';
      case 'BLOCKED':
        return 'Blocked';
      default:
        return status;
    }
  };

  const handleAssignSeat = async () => {
    if (!selectedSeat || !selectedStudent) {
      Alert.alert('Error', 'Please select both a seat and a student');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await assignFixedSeat({
        seatId: selectedSeat,
        studentId: selectedStudent,
        libraryId: user.libraryId || '',
        adminId: user._id || user.id || '',
      }).unwrap();
      
      Alert.alert('Success', 'Seat assigned successfully');
      setSelectedSeat(null);
      setSelectedStudent(null);
      refetchSeatLayout();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to assign seat');
    }
  };

  const handleUnassignSeat = async (seatId: string, studentId: string) => {
    try {
      await unassignFixedSeat({ seatId, studentId }).unwrap();
      Alert.alert('Success', 'Seat unassigned successfully');
      refetchSeatLayout();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to unassign seat');
    }
  };

  const renderSeatItem = ({ item }: { item: any }) => {
    const seatColor = getSeatColor(item.status);

    return (
      <TouchableOpacity
        onPress={() => setSelectedSeat(item._id)}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.seatCard,
            selectedSeat === item._id && {
              borderColor: theme.colors.primary,
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.seatHeader}>
            <View style={styles.seatInfo}>
              <Text style={[styles.seatNumber, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {item.seatNumber}
              </Text>
              <Badge
                label={getStatusLabel(item.status)}
                variant={
                  item.status === 'VACANT' || item.status === 'BLANK'
                    ? 'success'
                    : item.status === 'FILLED'
                    ? 'error'
                    : item.status === 'FIXED'
                    ? 'warning'
                    : 'default'
                }
                size="small"
              />
            </View>
            <Icon name="event-seat" size={32} color={seatColor} />
          </View>
          {item.currentAssignment && (
            <View style={styles.studentInfo}>
              <Icon name="person" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.studentName, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Student ID: {item.currentAssignment.studentId}
              </Text>
              {item.status === 'FIXED' && (
                <TouchableOpacity
                  onPress={() => handleUnassignSeat(item._id, item.currentAssignment.studentId)}
                  style={styles.unassignButton}
                >
                  <Text style={[styles.unassignText, { color: theme.colors.error }]}>Unassign</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedStudent(item._id)}
      activeOpacity={0.7}
    >
      <Card
        style={[
          styles.studentCard,
          selectedStudent === item._id && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
          },
        ]}
      >
        <View style={styles.studentRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="person" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.studentDetails}>
            <Text style={[styles.studentName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
              {item.name}
            </Text>
            <Text style={[styles.studentId, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              {item.email}
            </Text>
          </View>
          {selectedStudent === item._id && (
            <Icon name="check-circle" size={24} color={theme.colors.primary} />
          )}
        </View>
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
            Seat Management
          </Text>
          <TouchableOpacity onPress={() => router.push('/seats/layout')}>
            <Icon name="edit" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: view === 'layout' ? theme.colors.primary : theme.colors.surface,
              borderBottomColor: view === 'layout' ? theme.colors.primary : 'transparent',
            },
          ]}
          onPress={() => setView('layout')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: view === 'layout' ? '#FFFFFF' : theme.colors.textPrimary,
                ...theme.typography.body,
              },
            ]}
          >
            Seat Layout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: view === 'assignments' ? theme.colors.primary : theme.colors.surface,
              borderBottomColor: view === 'assignments' ? theme.colors.primary : 'transparent',
            },
          ]}
          onPress={() => setView('assignments')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: view === 'assignments' ? '#FFFFFF' : theme.colors.textPrimary,
                ...theme.typography.body,
              },
            ]}
          >
            Assignments
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'layout' ? (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Available
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Occupied
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Reserved
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.textSecondary }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                Maintenance
              </Text>
            </View>
          </View>

          {seatLayoutLoading ? (
            <LoadingSpinner />
          ) : seatLayoutError ? (
            <EmptyState
              icon="error-outline"
              title="Error loading seats"
              message="Please try again later"
            />
          ) : (
            <FlatList
              data={seats}
              renderItem={renderSeatItem}
              keyExtractor={(item) => item._id || item.seatNumber?.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.seatsList}
              onRefresh={refetchSeatLayout}
              refreshing={false}
              ListEmptyComponent={
                <EmptyState
                  icon="event-seat"
                  title="No seats found"
                  message="Seat layout not configured"
                />
              }
            />
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.assignSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Assign Seat
            </Text>
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="search"
              style={styles.searchInput}
            />
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              Select a student to assign a seat
            </Text>
          </View>

          {studentsLoading ? (
            <LoadingSpinner />
          ) : (
            <FlatList
              data={students}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.studentsList}
              ListEmptyComponent={
                <EmptyState
                  icon="people"
                  title="No students found"
                  message="No students match your search"
                />
              }
            />
          )}

          {selectedSeat && selectedStudent && (
            <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
              <Button
                title="Assign Seat"
                onPress={handleAssignSeat}
                variant="primary"
                loading={assigning}
                style={styles.assignButton}
              />
            </View>
          )}
        </ScrollView>
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontWeight: '500',
  },
  seatsList: {
    padding: 16,
  },
  seatCard: {
    marginBottom: 12,
    padding: 16,
  },
  seatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seatNumber: {
    fontWeight: '700',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  studentName: {
    marginLeft: 4,
  },
  category: {
    marginTop: 8,
  },
  assignSection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 8,
  },
  studentsList: {
    padding: 16,
    paddingTop: 0,
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
  studentDetails: {
    flex: 1,
  },
  studentId: {
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  assignButton: {
    width: '100%',
  },
});

