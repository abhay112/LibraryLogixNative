import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { FormSection } from '@/components/FormSection';
import { ButtonGroup } from '@/components/ButtonGroup';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useCreateStaffAttendanceMutation,
  useUpdateStaffAttendanceMutation,
  useGetStaffAttendanceQuery,
  useCreateStaffScheduleMutation,
  useGetStaffScheduleQuery,
  useUpdateStaffScheduleMutation,
  useDeleteStaffScheduleMutation,
} from '@/services/api/staffApi';

const roles = [
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'CLEANER', label: 'Cleaner' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ASSISTANT', label: 'Assistant' },
];

const roleColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  LIBRARIAN: 'primary',
  ACCOUNTANT: 'success',
  SECURITY: 'warning',
  CLEANER: 'info',
  MANAGER: 'error',
  ASSISTANT: 'info',
};

export default function StaffDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'LIBRARIAN' | 'ACCOUNTANT' | 'SECURITY' | 'CLEANER' | 'MANAGER' | 'ASSISTANT'>('LIBRARIAN');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'attendance' | 'schedule'>('details');
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceStatus, setAttendanceStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'>('PRESENT');
  const [scheduleDay, setScheduleDay] = useState<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'>('MONDAY');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');

  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
    refetch: refetchStaff,
  } = useGetStaffByIdQuery(id as string, { skip: !id });

  const [updateStaff, { isLoading: updating }] = useUpdateStaffMutation();
  const [deleteStaff, { isLoading: deleting }] = useDeleteStaffMutation();
  const [createAttendance, { isLoading: creatingAttendance }] = useCreateStaffAttendanceMutation();
  const [updateAttendance, { isLoading: updatingAttendance }] = useUpdateStaffAttendanceMutation();
  const [createSchedule, { isLoading: creatingSchedule }] = useCreateStaffScheduleMutation();
  const [updateSchedule, { isLoading: updatingSchedule }] = useUpdateStaffScheduleMutation();
  const [deleteSchedule, { isLoading: deletingSchedule }] = useDeleteStaffScheduleMutation();

  const staff = staffData?.data;

  // Fetch staff attendance
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useGetStaffAttendanceQuery(
    {
      staffId: id as string,
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },
    { skip: !id || activeTab !== 'attendance' }
  );

  // Fetch staff schedule
  const {
    data: scheduleData,
    isLoading: scheduleLoading,
    refetch: refetchSchedule,
  } = useGetStaffScheduleQuery(id as string, { skip: !id || activeTab !== 'schedule' });

  React.useEffect(() => {
    if (staff) {
      setName(staff.name || '');
      setEmail(staff.email || '');
      setMobile(staff.mobile || '');
      setRole(staff.role || 'LIBRARIAN');
      setEmployeeId(staff.employeeId || '');
      setDepartment(staff.department || '');
    }
  }, [staff]);

  const handleUpdate = async () => {
    if (!name || !email || !mobile) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateStaff({
        id: id as string,
        data: {
          name,
          email,
          mobile,
          role,
          employeeId: employeeId || undefined,
          department: department || undefined,
        },
      }).unwrap();
      
      Alert.alert('Success', 'Staff member updated successfully');
      setIsEditing(false);
      refetchStaff();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to update staff member');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Staff',
      'Are you sure you want to delete this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStaff(id as string).unwrap();
              Alert.alert('Success', 'Staff member deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete staff member');
            }
          },
        },
      ]
    );
  };

  const handleCreateAttendance = async () => {
    if (!id || !user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    try {
      await createAttendance({
        staffId: id as string,
        date: attendanceDate,
        status: attendanceStatus,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId,
      }).unwrap();
      Alert.alert('Success', 'Attendance recorded successfully');
      refetchAttendance();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to record attendance');
    }
  };

  const handleCreateSchedule = async () => {
    if (!id || !scheduleStartTime || !scheduleEndTime || !user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createSchedule({
        staffId: id as string,
        dayOfWeek: scheduleDay,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId,
      }).unwrap();
      Alert.alert('Success', 'Schedule created successfully');
      setScheduleStartTime('');
      setScheduleEndTime('');
      refetchSchedule();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchedule(scheduleId).unwrap();
              Alert.alert('Success', 'Schedule deleted successfully');
              refetchSchedule();
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  if (staffLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (staffError || !staff) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="error-outline"
          title="Error loading staff"
          message="Please try again later"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Staff Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {staff.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoSection}>
              {isEditing ? (
                <>
                  <Input
                    label="Name *"
                    value={name}
                    onChangeText={setName}
                    style={styles.editInput}
                  />
                  <Input
                    label="Email *"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.editInput}
                  />
                  <Input
                    label="Mobile *"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    style={styles.editInput}
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.name, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                    {staff.name}
                  </Text>
                  <Text style={[styles.email, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                    {staff.email}
                  </Text>
                  <Text style={[styles.mobile, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                    {staff.mobile}
                  </Text>
                </>
              )}
            </View>
            <Badge
              label={staff.role}
              variant={roleColors[staff.role] || 'info'}
            />
          </View>

          {isEditing ? (
            <>
              <FormSection label="Role *">
                <ButtonGroup
                  options={roles}
                  selectedValue={role}
                  onSelect={(value) => setRole(value as typeof role)}
                />
              </FormSection>
              <Input
                label="Employee ID"
                value={employeeId}
                onChangeText={setEmployeeId}
                style={styles.editInput}
              />
              <Input
                label="Department"
                value={department}
                onChangeText={setDepartment}
                style={styles.editInput}
              />
            </>
          ) : (
            <>
              {staff.employeeId && (
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Employee ID:</Text>
                  <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{staff.employeeId}</Text>
                </View>
              )}
              {staff.department && (
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Department:</Text>
                  <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{staff.department}</Text>
                </View>
              )}
            </>
          )}
        </Card>

        {/* Actions */}
        {user?.role === 'admin' && (
          <Card style={styles.actionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Actions
            </Text>
            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <Button
                    title="Save Changes"
                    onPress={handleUpdate}
                    variant="primary"
                    loading={updating}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setIsEditing(false);
                      // Reset form
                      setName(staff.name || '');
                      setEmail(staff.email || '');
                      setMobile(staff.mobile || '');
                      setRole(staff.role || 'LIBRARIAN');
                      setEmployeeId(staff.employeeId || '');
                      setDepartment(staff.department || '');
                    }}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                </>
              ) : (
                <>
                  <Button
                    title="Edit Staff"
                    onPress={() => setIsEditing(true)}
                    variant="primary"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Delete Staff"
                    onPress={handleDelete}
                    variant="error"
                    loading={deleting}
                    style={styles.actionButton}
                  />
                </>
              )}
            </View>
          </Card>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['details', 'attendance', 'schedule'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === tab ? theme.colors.primary : theme.colors.surface,
                  borderBottomColor: activeTab === tab ? theme.colors.primary : 'transparent',
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? '#FFFFFF' : theme.colors.textPrimary,
                    ...theme.typography.body,
                  },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <Card style={styles.tabCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Record Attendance
            </Text>
            <Input
              label="Date"
              value={attendanceDate}
              onChangeText={setAttendanceDate}
              placeholder="YYYY-MM-DD"
              style={styles.tabInput}
            />
            <FormSection label="Status">
              <ButtonGroup
                options={[
                  { value: 'PRESENT', label: 'Present' },
                  { value: 'ABSENT', label: 'Absent' },
                  { value: 'LATE', label: 'Late' },
                  { value: 'LEAVE', label: 'Leave' },
                ]}
                selectedValue={attendanceStatus}
                onSelect={(value) => setAttendanceStatus(value as typeof attendanceStatus)}
              />
            </FormSection>
            <Button
              title="Record Attendance"
              onPress={handleCreateAttendance}
              variant="primary"
              loading={creatingAttendance}
              style={styles.tabButton}
            />
            {attendanceLoading ? (
              <LoadingSpinner />
            ) : (
              <View style={styles.attendanceList}>
                {(attendanceData?.data || []).slice(0, 10).map((record: any) => (
                  <View key={record._id} style={styles.attendanceItem}>
                    <Text style={[styles.attendanceDate, { color: theme.colors.textPrimary }]}>
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </Text>
                    <Badge
                      label={record.status}
                      variant={
                        record.status === 'PRESENT' ? 'success' :
                        record.status === 'ABSENT' ? 'error' :
                        record.status === 'LATE' ? 'warning' : 'info'
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <Card style={styles.tabCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Create Schedule
            </Text>
            <FormSection label="Day of Week">
              <ButtonGroup
                options={[
                  { value: 'MONDAY', label: 'Mon' },
                  { value: 'TUESDAY', label: 'Tue' },
                  { value: 'WEDNESDAY', label: 'Wed' },
                  { value: 'THURSDAY', label: 'Thu' },
                  { value: 'FRIDAY', label: 'Fri' },
                  { value: 'SATURDAY', label: 'Sat' },
                  { value: 'SUNDAY', label: 'Sun' },
                ]}
                selectedValue={scheduleDay}
                onSelect={(value) => setScheduleDay(value as typeof scheduleDay)}
              />
            </FormSection>
            <Input
              label="Start Time"
              value={scheduleStartTime}
              onChangeText={setScheduleStartTime}
              placeholder="HH:mm"
              style={styles.tabInput}
            />
            <Input
              label="End Time"
              value={scheduleEndTime}
              onChangeText={setScheduleEndTime}
              placeholder="HH:mm"
              style={styles.tabInput}
            />
            <Button
              title="Create Schedule"
              onPress={handleCreateSchedule}
              variant="primary"
              loading={creatingSchedule}
              style={styles.tabButton}
            />
            {scheduleLoading ? (
              <LoadingSpinner />
            ) : (
              <View style={styles.scheduleList}>
                {(scheduleData?.data || []).map((schedule: any) => (
                  <View key={schedule._id} style={styles.scheduleItem}>
                    <View style={styles.scheduleInfo}>
                      <Text style={[styles.scheduleDay, { color: theme.colors.textPrimary }]}>
                        {schedule.dayOfWeek}
                      </Text>
                      <Text style={[styles.scheduleTime, { color: theme.colors.textSecondary }]}>
                        {schedule.startTime} - {schedule.endTime}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteSchedule(schedule._id)}>
                      <Icon name="delete" size={24} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}
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
  editInput: {
    marginBottom: 12,
  },
  actionsCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 16,
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
  tabCard: {
    marginTop: 16,
    padding: 20,
  },
  tabInput: {
    marginBottom: 12,
  },
  tabButton: {
    width: '100%',
    marginTop: 12,
  },
  attendanceList: {
    marginTop: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleList: {
    marginTop: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 12,
  },
});

