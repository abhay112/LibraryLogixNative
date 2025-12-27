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

  const {
    data: staffData,
    isLoading: staffLoading,
    error: staffError,
    refetch: refetchStaff,
  } = useGetStaffByIdQuery(id as string, { skip: !id });

  const [updateStaff, { isLoading: updating }] = useUpdateStaffMutation();
  const [deleteStaff, { isLoading: deleting }] = useDeleteStaffMutation();

  const staff = staffData?.data;

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
});

