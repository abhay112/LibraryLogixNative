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
import {
  useGetAttendanceByDateQuery,
  useGetAttendanceByShiftQuery,
  useMarkStudentAbsentMutation,
  useMarkMultipleStudentsAbsentMutation,
} from '@/services/api/attendanceApi';

export default function AttendanceScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedShift, setSelectedShift] = useState<'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY' | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'seats' | 'report'>('seats');

  // Fetch attendance data for today
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceByDateQuery(
    {
      date: today,
      adminId: user?._id || user?.id || '',
    },
    { skip: (!user?._id && !user?.id) }
  );

  // Fetch attendance by shift
  const {
    data: attendanceByShiftData,
    isLoading: shiftLoading,
    refetch: refetchShiftAttendance,
  } = useGetAttendanceByShiftQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      date: today,
      shift: selectedShift,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId || viewMode !== 'report' }
  );

  const [markAbsent] = useMarkStudentAbsentMutation();
  const [markMultipleAbsent] = useMarkMultipleStudentsAbsentMutation();

  const seats = attendanceData?.data?.seats || [];
  const attendance = attendanceData?.data?.attendance;
  const shiftReport = attendanceByShiftData?.data;

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

  const renderSeat = ({ item }: { item: any }) => {
    const seatColor = getSeatColor(item.status);
    const isAvailable = item.status === 'VACANT' || item.status === 'BLANK';

    return (
      <TouchableOpacity
        style={[
          styles.seat,
          {
            backgroundColor: isAvailable ? seatColor + '20' : theme.colors.surface,
            borderColor: seatColor,
            borderWidth: 2,
          },
        ]}
        onPress={() => router.push('/attendance/mark')}
        disabled={!isAvailable}
      >
        <Text
          style={[
            styles.seatNumber,
            {
              color: theme.colors.textPrimary,
              ...theme.typography.body,
            },
          ]}
        >
          {item.seatNumber}
        </Text>
        {!isAvailable && (
          <Icon
            name={item.status === 'FILLED' ? 'person' : 'block'}
            size={16}
            color={seatColor}
          />
        )}
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
          Attendance
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'seats' ? 'report' : 'seats')}
            style={styles.viewModeButton}
          >
            <Icon
              name={viewMode === 'seats' ? 'list' : 'event-seat'}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/attendance/mark')}>
            <Icon name="add-circle" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'report' && (
        <View style={styles.shiftFilters}>
          {(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'] as const).map((shift) => (
            <TouchableOpacity
              key={shift}
              style={[
                styles.shiftButton,
                {
                  backgroundColor: selectedShift === shift ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setSelectedShift(selectedShift === shift ? undefined : shift)}
            >
              <Text
                style={[
                  styles.shiftButtonText,
                  {
                    color: selectedShift === shift ? '#FFFFFF' : theme.colors.textPrimary,
                    ...theme.typography.body,
                  },
                ]}
              >
                {shift}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="check-circle" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                Today's Attendance
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                {format(new Date(), 'EEEE, MMMM dd, yyyy')}
              </Text>
            </View>
          </View>
        </Card>

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
              Fixed
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Blocked
            </Text>
          </View>
        </View>

        {viewMode === 'seats' ? (
          attendanceLoading ? (
            <LoadingSpinner />
          ) : attendanceError ? (
            <EmptyState
              icon="error-outline"
              title="Error loading attendance"
              message="Please try again later"
            />
          ) : (
            <View style={styles.seatsContainer}>
              <FlatList
                data={seats}
                renderItem={renderSeat}
                keyExtractor={(item) => item._id || item.seatNumber?.toString()}
                numColumns={4}
                scrollEnabled={false}
                contentContainerStyle={styles.seatsGrid}
                ListEmptyComponent={
                  <EmptyState
                    icon="event-seat"
                    title="No seats available"
                    message="Seat layout not configured"
                  />
                }
              />
            </View>
          )
        ) : (
          shiftLoading ? (
            <LoadingSpinner />
          ) : shiftReport ? (
            <>
              {shiftReport.summary && (
                <Card style={styles.summaryCard}>
                  <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                    Summary
                  </Text>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                        {shiftReport.summary.totalStudents}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                        {shiftReport.summary.present}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Present</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.error, ...theme.typography.h2 }]}>
                        {shiftReport.summary.absent}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Absent</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: theme.colors.warning, ...theme.typography.h2 }]}>
                        {shiftReport.summary.late}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Late</Text>
                    </View>
                  </View>
                </Card>
              )}
              <FlatList
                data={shiftReport.students}
                renderItem={({ item }) => (
                  <Card style={styles.studentCard}>
                    <View style={styles.studentRow}>
                      <View style={styles.studentInfo}>
                        <Text style={[styles.studentName, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                          {item.studentName}
                        </Text>
                        <Text style={[styles.studentEmail, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                          {item.studentEmail}
                        </Text>
                        {item.checkInTime && (
                          <Text style={[styles.checkInTime, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                            Check-in: {format(new Date(item.checkInTime), 'HH:mm')}
                          </Text>
                        )}
                      </View>
                      <Badge
                        label={item.status}
                        variant={
                          item.status === 'PRESENT' ? 'success' :
                          item.status === 'ABSENT' ? 'error' :
                          item.status === 'LATE' ? 'warning' : 'info'
                        }
                      />
                    </View>
                  </Card>
                )}
                keyExtractor={(item) => item.studentId}
                contentContainerStyle={styles.reportList}
                ListEmptyComponent={
                  <EmptyState
                    icon="people"
                    title="No students found"
                    message="No students match the selected shift"
                  />
                }
              />
            </>
          ) : (
            <EmptyState
              icon="list"
              title="No attendance data"
              message="Select a shift to view attendance report"
            />
          )
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
  infoCard: {
    margin: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
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
  seatsContainer: {
    padding: 16,
  },
  seatsGrid: {
    gap: 12,
  },
  seat: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5%',
  },
  seatNumber: {
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  viewModeButton: {
    padding: 4,
  },
  shiftFilters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  shiftButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    margin: 16,
    padding: 20,
  },
  summaryTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    marginBottom: 4,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
  },
  reportList: {
    padding: 16,
    paddingTop: 0,
  },
  studentCard: {
    marginBottom: 12,
    padding: 16,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  studentEmail: {
    marginTop: 2,
  },
  checkInTime: {
    marginTop: 4,
  },
});

