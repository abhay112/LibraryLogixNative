import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { TextArea } from '@/components/TextArea';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CommonStyles } from '@/constants/CommonStyles';
import { useCreateQueryMutation } from '@/services/api/queriesApi';

export default function SubmitQueryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  
  const [createQuery, { isLoading: loading }] = useCreateQueryMutation();

  const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const handleSubmit = async () => {
    if (!subject || !question) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createQuery({
        subject,
        question,
        priority,
        studentId: user?.id || user?._id,
        adminId: user?.role === 'admin' ? (user?._id || user?.id) : undefined,
        libraryId: user?.libraryId,
      }).unwrap();
      
      Alert.alert('Success', 'Query submitted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to submit query. Please try again.');
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <ScreenHeader title="Submit Query" />

        <ScrollView
          style={CommonStyles.content}
          contentContainerStyle={CommonStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Subject"
            placeholder="Enter query subject"
            value={subject}
            onChangeText={setSubject}
            leftIcon="subject"
          />

          <FormSection label="Priority">
            <ButtonGroup
              options={priorities}
              selectedValue={priority}
              onSelect={(value) => setPriority(value as typeof priority)}
            />
          </FormSection>

          <TextArea
            label="Question"
            placeholder="Describe your query in detail..."
            value={question}
            onChangeText={setQuestion}
            numberOfLines={8}
          />

          <TouchableOpacity style={CommonStyles.attachButton}>
            <Icon name="attach-file" size={20} color={theme.colors.primary} />
            <Text style={[CommonStyles.attachText, { color: theme.colors.primary, ...theme.typography.body }]}>
              Attach File (Optional)
            </Text>
          </TouchableOpacity>

          <Button
            title="Submit Query"
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}


