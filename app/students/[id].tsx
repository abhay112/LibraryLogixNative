import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import {
  useGetStudentDetailsQuery,
  useBlockStudentMutation,
  useActivateStudentMutation,
  useInactivateStudentMutation,
  useChangeStudentShiftMutation,
} from '@/services/api/studentsApi';
import { useGetFeesByStudentQuery } from '@/services/api/feesApi';
import { useGetStudentAttendanceHistoryQuery } from '@/services/api/attendanceApi';
import { Button } from '@/components/Button';
import { Alert } from 'react-native';

export default function StudentDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showActions, setShowActions] = React.useState(false);

  // Fetch student details
  const {
    data: studentData,
    isLoading: studentLoading,
    error: studentError,
  } = useGetStudentDetailsQuery(id as string, { skip: !id });

  // Fetch student fees
  const {
    data: feesData,
    isLoading: feesLoading,
  } = useGetFeesByStudentQuery(id as string, { skip: !id });

  // Fetch attendance history
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
  } = useGetStudentAttendanceHistoryQuery(
    { studentId: id as string },
    { skip: !id }
  );

  const [blockStudent] = useBlockStudentMutation();
  const [activateStudent] = useActivateStudentMutation();
  const [inactivateStudent] = useInactivateStudentMutation();
  const [changeShift] = useChangeStudentShiftMutation();

  const student = studentData?.data?.studentInformation || studentData?.data?.student;
  const fees = feesData?.data || [];
  const attendanceHistory = attendanceData?.data?.attendanceRecords || [];
  const attendanceSummary = attendanceData?.data?.summary;

  const handleBlock = async () => {
    Alert.alert(
      'Block Student',
      'Are you sure you want to block this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockStudent({ id: id as string }).unwrap();
              Alert.alert('Success', 'Student blocked successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to block student');
            }
          },
        },
      ]
    );
  };

  const handleActivate = async () => {
    Alert.alert(
      'Activate Student',
      'Are you sure you want to activate this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              await activateStudent({ id: id as string }).unwrap();
              Alert.alert('Success', 'Student activated successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to activate student');
            }
          },
        },
      ]
    );
  };

  const handleInactivate = async () => {
    Alert.alert(
      'Inactivate Student',
      'Are you sure you want to inactivate this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Inactivate',
          onPress: async () => {
            try {
              await inactivateStudent(id as string).unwrap();
              Alert.alert('Success', 'Student inactivated successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to inactivate student');
            }
          },
        },
      ]
    );
  };

  const handleChangeShift = () => {
    Alert.prompt(
      'Change Shift',
      'Select new shift:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Morning',
          onPress: async () => {
            try {
              await changeShift({ id: id as string, data: { newShift: 'morning' } }).unwrap();
              Alert.alert('Success', 'Shift changed successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to change shift');
            }
          },
        },
        {
          text: 'Afternoon',
          onPress: async () => {
            try {
              await changeShift({ id: id as string, data: { newShift: 'afternoon' } }).unwrap();
              Alert.alert('Success', 'Shift changed successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to change shift');
            }
          },
        },
        {
          text: 'Evening',
          onPress: async () => {
            try {
              await changeShift({ id: id as string, data: { newShift: 'evening' } }).unwrap();
              Alert.alert('Success', 'Shift changed successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to change shift');
            }
          },
        },
        {
          text: 'Full Day',
          onPress: async () => {
            try {
              await changeShift({ id: id as string, data: { newShift: 'full_day' } }).unwrap();
              Alert.alert('Success', 'Shift changed successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to change shift');
            }
          },
        },
      ],
      'default'
    );
  };

  if (studentLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (studentError || !student) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="error-outline"
          title="Error loading student"
          message="Please try again later"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Student Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {student.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={[styles.name, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {student.name}
              </Text>
              <Text style={[styles.email, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                {student.email}
              </Text>
              <Text style={[styles.mobile, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                {student.mobile}
              </Text>
            </View>
            <View style={styles.badgeContainer}>
              <Badge
                label={student.active ? 'Active' : 'Inactive'}
                variant={student.active ? 'success' : 'error'}
              />
              {student.blocked && (
                <Badge label="Blocked" variant="error" style={styles.badge} />
              )}
              {student.isPaused && (
                <Badge label="Paused" variant="warning" style={styles.badge} />
              )}
            </View>
          </View>
          <View style={styles.actionButtons}>
            {student.active ? (
              <>
                <Button
                  title="Inactivate"
                  onPress={handleInactivate}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Block"
                  onPress={handleBlock}
                  variant="outline"
                  size="small"
                  style={[styles.actionButton, { borderColor: theme.colors.error }]}
                  textStyle={{ color: theme.colors.error }}
                />
              </>
            ) : (
              <Button
                title="Activate"
                onPress={handleActivate}
                variant="primary"
                size="small"
                style={styles.actionButton}
              />
            )}
            <Button
              title="Change Shift"
              onPress={handleChangeShift}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </View>
          {student.shift && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Shift:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{student.shift}</Text>
            </View>
          )}
          {student.type && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{student.type}</Text>
            </View>
          )}
        </Card>

        {/* Attendance Summary */}
        {attendanceSummary && (
          <Card style={styles.summaryCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Attendance Summary
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                  {attendanceSummary.totalDays || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Days</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                  {attendanceSummary.presentDays || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Present</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.error, ...theme.typography.h2 }]}>
                  {attendanceSummary.absentDays || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Absent</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Fees Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Fees
            </Text>
            <TouchableOpacity onPress={() => router.push(`/fees?studentId=${id}`)}>
              <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {feesLoading ? (
            <LoadingSpinner />
          ) : fees.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No fees records</Text>
          ) : (
            fees.slice(0, 3).map((fee: any) => (
              <View key={fee._id} style={styles.feeItem}>
                <View>
                  <Text style={[styles.feeType, { color: theme.colors.textPrimary }]}>
                    {fee.fees?.[0]?.type || 'Library Fee'}
                  </Text>
                  <Text style={[styles.feeAmount, { color: theme.colors.textSecondary }]}>
                    ₹{fee.amount || fee.fees?.[0]?.amount || 0}
                  </Text>
                </View>
                <Badge
                  label={fee.status || 'pending'}
                  variant={fee.status === 'paid' ? 'success' : 'warning'}
                />
              </View>
            ))
          )}
        </Card>

        {/* Recent Attendance */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Recent Attendance
          </Text>
          {attendanceLoading ? (
            <LoadingSpinner />
          ) : attendanceHistory.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No attendance records</Text>
          ) : (
            attendanceHistory.slice(0, 5).map((record: any, index: number) => (
              <View key={index} style={styles.attendanceItem}>
                <View>
                  <Text style={[styles.attendanceDate, { color: theme.colors.textPrimary }]}>
                    {record.date ? format(new Date(record.date), 'MMM dd, yyyy') : 'N/A'}
                  </Text>
                  <Text style={[styles.attendanceStatus, { color: theme.colors.textSecondary }]}>
                    {record.status || 'N/A'}
                  </Text>
                </View>
                <Badge
                  label={record.status === 'PRESENT' ? 'Present' : 'Absent'}
                  variant={record.status === 'PRESENT' ? 'success' : 'error'}
                />
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  infoSection: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
    fontWeight: '600',
  },
  email: {
    marginBottom: 2,
  },
  mobile: {
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 4,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  feeType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  attendanceStatus: {
    fontSize: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
});

