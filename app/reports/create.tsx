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
import { useCreateReportMutation } from '@/services/api/reportsApi';
import type { ReportType } from '@/services/api/reportsApi';

const reportTypes = [
  { value: 'ATTENDANCE', label: 'Attendance' },
  { value: 'FEES', label: 'Fees' },
  { value: 'STUDENT_PERFORMANCE', label: 'Student Performance' },
  { value: 'SEAT_UTILIZATION', label: 'Seat Utilization' },
  { value: 'FINANCIAL', label: 'Financial' },
  { value: 'STAFF_ATTENDANCE', label: 'Staff Attendance' },
  { value: 'VISITOR', label: 'Visitor' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'CUSTOM', label: 'Custom' },
];

export default function CreateReportScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('ATTENDANCE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [createReport, { isLoading: loading }] = useCreateReportMutation();

  const handleSubmit = async () => {
    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await createReport({
        reportType,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId || '',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }).unwrap();
      
      Alert.alert('Success', 'Report created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create report. Please try again.');
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <FormSection label="Report Type *">
          <ButtonGroup
            options={reportTypes}
            selectedValue={reportType}
            onSelect={(value) => setReportType(value as ReportType)}
          />
        </FormSection>

        <Input
          label="Start Date (Optional)"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          leftIcon="calendar-today"
        />

        <Input
          label="End Date (Optional)"
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
          leftIcon="calendar-today"
        />

        <Button
          title="Create Report"
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

