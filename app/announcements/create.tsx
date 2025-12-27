import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCreateAnnouncementMutation } from '@/services/api/communicationApi';

const targetAudiences = [
  { value: 'all' as const, label: 'All Users' },
  { value: 'students' as const, label: 'Students Only' },
  { value: 'parents' as const, label: 'Parents Only' },
];

export default function CreateAnnouncementScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'INFO' | 'WARNING' | 'URGENT' | 'EMERGENCY'>('INFO');
  const [targetAudience, setTargetAudience] = useState<'all' | 'students' | 'parents'>('all');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const [createAnnouncement, { isLoading: loading }] = useCreateAnnouncementMutation();

  const handleSubmit = async () => {
    if (!title || !message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await createAnnouncement({
        title,
        message,
        priority,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId || '',
        targetAudience: targetAudience === 'all' ? ['all'] : [targetAudience],
      }).unwrap();
      
      Alert.alert('Success', 'Announcement created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create announcement. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          Create Announcement
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Title"
          placeholder="Enter announcement title"
          value={title}
          onChangeText={setTitle}
          leftIcon="title"
        />

        <View style={styles.textAreaContainer}>
          <Text style={[styles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
            Message
          </Text>
          <View
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.sm,
              },
            ]}
          >
            <Input
              placeholder="Enter announcement message..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              style={styles.textAreaInput}
            />
          </View>
        </View>

        <View style={styles.audienceSection}>
          <Text style={[styles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
            Priority
          </Text>
          <View style={styles.audienceButtons}>
            {[
              { value: 'INFO' as const, label: 'Info' },
              { value: 'WARNING' as const, label: 'Warning' },
              { value: 'URGENT' as const, label: 'Urgent' },
              { value: 'EMERGENCY' as const, label: 'Emergency' },
            ].map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.audienceButton,
                  {
                    backgroundColor: priority === p.value ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.audienceText,
                    {
                      color: priority === p.value ? '#FFFFFF' : theme.colors.textPrimary,
                      ...theme.typography.body,
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.audienceSection}>
          <Text style={[styles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
            Target Audience
          </Text>
          <View style={styles.audienceButtons}>
            {targetAudiences.map((audience) => (
              <TouchableOpacity
                key={audience.value}
                style={[
                  styles.audienceButton,
                  {
                    backgroundColor: targetAudience === audience.value ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setTargetAudience(audience.value)}
              >
                <Text
                  style={[
                    styles.audienceText,
                    {
                      color: targetAudience === audience.value ? '#FFFFFF' : theme.colors.textPrimary,
                      ...theme.typography.body,
                    },
                  ]}
                >
                  {audience.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <Text style={[styles.label, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
            Schedule (Optional)
          </Text>
          <View style={styles.scheduleRow}>
            <Input
              placeholder="Date"
              value={scheduleDate}
              onChangeText={setScheduleDate}
              leftIcon="calendar-today"
              style={styles.scheduleInput}
            />
            <Input
              placeholder="Time"
              value={scheduleTime}
              onChangeText={setScheduleTime}
              leftIcon="schedule"
              style={styles.scheduleInput}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.attachButton}>
          <Icon name="attach-file" size={20} color={theme.colors.primary} />
          <Text style={[styles.attachText, { color: theme.colors.primary, ...theme.typography.body }]}>
            Attach File (Optional)
          </Text>
        </TouchableOpacity>

        <Button
          title="Send Announcement"
          onPress={handleSubmit}
          variant="primary"
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  textAreaContainer: {
    marginVertical: 16,
  },
  label: {
    marginBottom: 12,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    marginTop: 8,
    minHeight: 150,
  },
  textAreaInput: {
    textAlignVertical: 'top',
    padding: 12,
    minHeight: 150,
  },
  audienceSection: {
    marginVertical: 16,
  },
  audienceButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  audienceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  audienceText: {
    fontWeight: '600',
  },
  scheduleSection: {
    marginVertical: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  scheduleInput: {
    flex: 1,
    marginBottom: 0,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  attachText: {
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 8,
  },
});

