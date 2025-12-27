import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

// Mock data - in real app, fetch based on id
const mockExam = {
  id: '1',
  name: 'Mathematics Midterm',
  subject: 'Mathematics',
  date: '2024-10-20',
  time: '10:00',
  duration: 120,
  instructions: `1. Bring a valid ID card
2. Calculator is allowed
3. No mobile phones
4. Arrive 15 minutes early
5. Read all questions carefully`,
  status: 'upcoming' as const,
  score: undefined,
  grade: undefined,
};

export default function ExamDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          Exam Details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.examCard}>
          <View style={styles.examHeader}>
            <Text style={[styles.examName, { color: theme.colors.textPrimary, ...theme.typography.h1 }]}>
              {mockExam.name}
            </Text>
            <Badge
              label={mockExam.status === 'upcoming' ? 'Upcoming' : 'Completed'}
              variant={mockExam.status === 'upcoming' ? 'info' : 'success'}
            />
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Icon name="subject" size={20} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Subject
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                  {mockExam.subject}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="event" size={20} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Date & Time
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                  {format(new Date(mockExam.date), 'MMMM dd, yyyy')} at {mockExam.time}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="schedule" size={20} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Duration
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                  {mockExam.duration} minutes
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.instructionsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Instructions
          </Text>
          <Text style={[styles.instructions, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
            {mockExam.instructions}
          </Text>
        </Card>

        {mockExam.status === 'completed' && mockExam.score !== undefined && (
          <Card style={styles.resultsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Results
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={[styles.score, { color: theme.colors.primary, ...theme.typography.h1 }]}>
                {mockExam.score}%
              </Text>
              <Badge label={mockExam.grade || 'A'} variant="success" size="small" />
            </View>
            <Button
              title="View Detailed Results"
              onPress={() => router.push(`/exams/${id}/results`)}
              variant="outline"
              style={styles.resultsButton}
            />
            <Button
              title="Download Certificate"
              onPress={() => {}}
              variant="text"
              style={styles.downloadButton}
            />
          </Card>
        )}
      </ScrollView>

      {mockExam.status === 'upcoming' && (
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <Button
            title="Start Exam"
            onPress={() => router.push(`/exams/${id}/start`)}
            variant="primary"
            style={styles.startButton}
          />
        </View>
      )}
    </View>
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
  examCard: {
    marginBottom: 16,
    padding: 20,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  examName: {
    flex: 1,
    marginRight: 12,
  },
  detailsSection: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600',
  },
  instructionsCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  instructions: {
    lineHeight: 24,
  },
  resultsCard: {
    marginBottom: 16,
    padding: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  score: {
    fontWeight: '700',
  },
  resultsButton: {
    marginBottom: 12,
  },
  downloadButton: {
    marginTop: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  startButton: {
    width: '100%',
  },
});

