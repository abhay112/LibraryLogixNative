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
import { useCreateStudentMutation } from '@/services/api/studentsApi';

const shifts = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'full_day', label: 'Full Day' },
];


export default function CreateStudentScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'evening' | 'full_day'>('morning');
  const [amount, setAmount] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  const [createStudent, { isLoading: loading }] = useCreateStudentMutation();

  const handleSubmit = async () => {
    if (!name || !email || !mobile || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await createStudent({
        name,
        email,
        mobile,
        password,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId || '',
        shift,
        amount: amount ? parseFloat(amount) : undefined,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining).toISOString() : undefined,
        gender,
      }).unwrap();
      
      Alert.alert('Success', 'Student created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create student. Please try again.');
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
          placeholder="Enter student name"
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

        <Input
          label="Password *"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon="lock"
        />

        <FormSection label="Shift">
          <ButtonGroup
            options={shifts}
            selectedValue={shift}
            onSelect={(value) => setShift(value as typeof shift)}
          />
        </FormSection>

        <FormSection label="Gender">
          <ButtonGroup
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            selectedValue={gender}
            onSelect={(value) => setGender(value as typeof gender)}
          />
        </FormSection>

        <Input
          label="Date of Joining"
          placeholder="YYYY-MM-DD"
          value={dateOfJoining}
          onChangeText={setDateOfJoining}
          leftIcon="calendar-today"
        />

        <Input
          label="Amount (Optional)"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          leftIcon="account-balance-wallet"
        />

        <Button
          title="Create Student"
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

