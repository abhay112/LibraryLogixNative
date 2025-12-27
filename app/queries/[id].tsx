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
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextArea } from '@/components/TextArea';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';
import {
  useGetQueryByIdQuery,
  useAnswerQueryMutation,
  useUpdateQueryStatusMutation,
  useDeleteQueryMutation,
} from '@/services/api/queriesApi';

const priorityColors = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'error',
  URGENT: 'error',
} as const;

export default function QueryDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [answer, setAnswer] = useState('');

  // Fetch query details
  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
    refetch: refetchQuery,
  } = useGetQueryByIdQuery(id as string, { skip: !id });

  const [answerQuery, { isLoading: answering }] = useAnswerQueryMutation();
  const [updateStatus, { isLoading: updating }] = useUpdateQueryStatusMutation();
  const [deleteQuery, { isLoading: deleting }] = useDeleteQueryMutation();

  const query = queryData?.data;

  const handleAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    if (!user?._id && !user?.id) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await answerQuery({
        id: id as string,
        adminId: user._id || user.id || '',
        data: { answer },
      }).unwrap();
      
      setAnswer('');
      Alert.alert('Success', 'Query answered successfully');
      refetchQuery();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to answer query');
    }
  };

  const handleStatusUpdate = async (status: 'PENDING' | 'ANSWERED' | 'CLOSED') => {
    try {
      await updateStatus({
        id: id as string,
        data: { status },
      }).unwrap();
      
      Alert.alert('Success', 'Query status updated successfully');
      refetchQuery();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Query',
      'Are you sure you want to delete this query?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteQuery(id as string).unwrap();
              Alert.alert('Success', 'Query deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete query');
            }
          },
        },
      ]
    );
  };

  if (queryLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (queryError || !query) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="error-outline"
          title="Error loading query"
          message="Please try again later"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Query Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={styles.infoSection}>
              <Text style={[styles.subject, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {query.subject || 'No Subject'}
              </Text>
              {query.createdAt && (
                <Text style={[styles.date, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  {format(new Date(query.createdAt), 'MMM dd, yyyy HH:mm')}
                </Text>
              )}
            </View>
            <View style={styles.badges}>
              <Badge
                label={query.priority || 'MEDIUM'}
                variant={priorityColors[query.priority as keyof typeof priorityColors] || 'info'}
                size="small"
              />
              <Badge
                label={query.status || 'PENDING'}
                variant={query.status === 'ANSWERED' ? 'success' : query.status === 'CLOSED' ? 'info' : 'warning'}
                size="small"
              />
            </View>
          </View>

          <View style={styles.questionSection}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Question:</Text>
            <Text style={[styles.question, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
              {query.question}
            </Text>
          </View>

          {query.answer && (
            <View style={styles.answerSection}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Answer:</Text>
              <Text style={[styles.answer, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                {query.answer}
              </Text>
              {query.answeredAt && (
                <Text style={[styles.answeredDate, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Answered on {format(new Date(query.answeredAt), 'MMM dd, yyyy HH:mm')}
                </Text>
              )}
            </View>
          )}
        </Card>

        {/* Answer Section (if not answered) */}
        {query.status !== 'ANSWERED' && user?.role === 'admin' && (
          <Card style={styles.answerCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Answer Query
            </Text>
            <TextArea
              placeholder="Enter your answer..."
              value={answer}
              onChangeText={setAnswer}
              numberOfLines={6}
            />
            <Button
              title="Submit Answer"
              onPress={handleAnswer}
              variant="primary"
              loading={answering}
              style={styles.submitButton}
            />
          </Card>
        )}

        {/* Actions (Admin Only) */}
        {user?.role === 'admin' && (
          <Card style={styles.actionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Actions
            </Text>
            <View style={styles.actionButtons}>
              {query.status !== 'CLOSED' && (
                <Button
                  title="Mark as Closed"
                  onPress={() => handleStatusUpdate('CLOSED')}
                  variant="secondary"
                  loading={updating}
                  style={styles.actionButton}
                />
              )}
              {query.status !== 'ANSWERED' && query.answer && (
                <Button
                  title="Mark as Answered"
                  onPress={() => handleStatusUpdate('ANSWERED')}
                  variant="primary"
                  loading={updating}
                  style={styles.actionButton}
                />
              )}
              <Button
                title="Delete Query"
                onPress={handleDelete}
                variant="error"
                loading={deleting}
                style={styles.actionButton}
              />
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoSection: {
    flex: 1,
    marginRight: 12,
  },
  subject: {
    marginBottom: 4,
    fontWeight: '600',
  },
  date: {
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  questionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  answerSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  question: {
    lineHeight: 22,
  },
  answer: {
    lineHeight: 22,
    marginBottom: 8,
  },
  answeredDate: {
    marginTop: 4,
  },
  answerCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  answerInput: {
    marginBottom: 16,
    minHeight: 120,
  },
  submitButton: {
    marginTop: 8,
  },
  actionsCard: {
    marginBottom: 16,
    padding: 20,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});

