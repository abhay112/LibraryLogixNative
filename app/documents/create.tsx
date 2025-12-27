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
import { useCreateDocumentMutation } from '@/services/api/documentsApi';
import { useGetStudentsQuery } from '@/services/api/studentsApi';

const documentTypes = [
  { value: 'ID_PROOF', label: 'ID Proof' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof' },
  { value: 'EDUCATION_CERTIFICATE', label: 'Education Certificate' },
  { value: 'OTHER', label: 'Other' },
];

export default function CreateDocumentScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [documentType, setDocumentType] = useState<'ID_PROOF' | 'ADDRESS_PROOF' | 'EDUCATION_CERTIFICATE' | 'OTHER'>('ID_PROOF');
  const [studentId, setStudentId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [createDocument, { isLoading: loading }] = useCreateDocumentMutation();

  // Fetch students for selection
  const { data: studentsData } = useGetStudentsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      limit: 100,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const students = studentsData?.data || [];

  const handleSubmit = async () => {
    if (!fileUrl) {
      Alert.alert('Error', 'Please enter file URL');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await createDocument({
        documentType,
        fileUrl,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId || '',
        studentId: studentId || undefined,
        expiryDate: expiryDate || undefined,
      }).unwrap();
      
      Alert.alert('Success', 'Document created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create document. Please try again.');
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <FormSection label="Document Type *">
          <ButtonGroup
            options={documentTypes}
            selectedValue={documentType}
            onSelect={(value) => setDocumentType(value as typeof documentType)}
          />
        </FormSection>

        <Input
          label="File URL *"
          placeholder="Enter file URL or path"
          value={fileUrl}
          onChangeText={setFileUrl}
          leftIcon="link"
        />

        <Input
          label="Student ID (Optional)"
          placeholder="Enter student ID"
          value={studentId}
          onChangeText={setStudentId}
          leftIcon="person"
        />

        <Input
          label="Expiry Date (Optional)"
          placeholder="YYYY-MM-DD"
          value={expiryDate}
          onChangeText={setExpiryDate}
          leftIcon="calendar-today"
        />

        <Button
          title="Create Document"
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

