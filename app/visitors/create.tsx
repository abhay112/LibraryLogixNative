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
import { useCreateVisitorMutation } from '@/services/api/visitorsApi';

export default function CreateVisitorScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [purpose, setPurpose] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const [createVisitor, { isLoading: loading }] = useCreateVisitorMutation();

  const handleSubmit = async () => {
    if (!name || !mobile || !purpose) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await createVisitor({
        name,
        email: email || undefined,
        mobile,
        purpose,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId || '',
        validUntil: validUntil || undefined,
      }).unwrap();
      
      Alert.alert('Success', 'Visitor registered successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to register visitor. Please try again.');
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
          placeholder="Enter visitor name"
          value={name}
          onChangeText={setName}
          leftIcon="person"
        />

        <Input
          label="Email (Optional)"
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
          label="Purpose *"
          placeholder="Enter visit purpose"
          value={purpose}
          onChangeText={setPurpose}
          leftIcon="description"
        />

        <Input
          label="Valid Until (Optional)"
          placeholder="YYYY-MM-DD"
          value={validUntil}
          onChangeText={setValidUntil}
          leftIcon="calendar-today"
        />

        <Button
          title="Register Visitor"
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

