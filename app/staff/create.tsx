import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { FormSection } from '@/components/FormSection';
import { ButtonGroup } from '@/components/ButtonGroup';
import { useCreateStaffMutation } from '@/services/api/staffApi';

const roles = [
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'CLEANER', label: 'Cleaner' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ASSISTANT', label: 'Assistant' },
];

export default function CreateStaffScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'LIBRARIAN' | 'ACCOUNTANT' | 'SECURITY' | 'CLEANER' | 'MANAGER' | 'ASSISTANT'>('LIBRARIAN');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');

  const [createStaff, { isLoading: loading }] = useCreateStaffMutation();

  const handleSubmit = async () => {
    if (!name || !email || !mobile) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await createStaff({
        name,
        email,
        mobile,
        role,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId || '',
        employeeId: employeeId || undefined,
        department: department || undefined,
      }).unwrap();
      
      Alert.alert('Success', 'Staff member created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create staff member. Please try again.');
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Name *"
          placeholder="Enter staff name"
          value={name}
          onChangeText={setName}
          leftIcon="person"
        />

        <Input
          label="Email *"
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="email"
        />

        <Input
          label="Mobile *"
          placeholder="Enter mobile number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          leftIcon="phone"
        />

        <FormSection label="Role *">
          <ButtonGroup
            options={roles}
            selectedValue={role}
            onSelect={(value) => setRole(value as typeof role)}
          />
        </FormSection>

        <Input
          label="Employee ID (Optional)"
          placeholder="Enter employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          leftIcon="badge"
        />

        <Input
          label="Department (Optional)"
          placeholder="Enter department"
          value={department}
          onChangeText={setDepartment}
          leftIcon="business"
        />

        <Button
          title="Create Staff"
          onPress={handleSubmit}
          variant="primary"
          loading={loading}
          style={styles.submitButton}
        />
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
  submitButton: {
    marginTop: 24,
  },
});

