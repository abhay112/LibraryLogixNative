import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

// Mock data
const mockExams = [
  {
    id: '1',
    name: 'Mathematics Midterm',
    subject: 'Mathematics',
    date: '2024-10-20',
    time: '10:00',
    duration: 120,
    instructions: 'Bring calculator and ID card',
    status: 'upcoming' as const,
  },
  {
    id: '2',
    name: 'Physics Final',
    subject: 'Physics',
    date: '2024-10-25',
    time: '14:00',
    duration: 180,
    instructions: 'No calculators allowed',
    status: 'upcoming' as const,
  },
  {
    id: '3',
    name: 'Chemistry Quiz',
    subject: 'Chemistry',
    date: '2024-10-10',
    time: '09:00',
    duration: 60,
    instructions: 'Periodic table provided',
    status: 'completed' as const,
    score: 85,
    grade: 'A',
  },
];

export default function ExamsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const filteredExams = mockExams.filter((exam) => {
    if (filter === 'upcoming') return exam.status === 'upcoming';
    return exam.status === 'completed';
  });

  const renderExamItem = ({ item }: { item: typeof mockExams[0] }) => (
    <TouchableOpacity
      onPress={() => router.push(`/exams/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.examCard}>
        <View style={styles.examHeader}>
          <View style={styles.examInfo}>
            <Text style={[styles.examName, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              {item.name}
            </Text>
            <View style={styles.examMeta}>
              <Icon name="subject" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.examMetaText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                {item.subject}
              </Text>
            </View>
          </View>
          <Badge
            label={item.status === 'upcoming' ? 'Upcoming' : 'Completed'}
            variant={item.status === 'upcoming' ? 'info' : 'success'}
          />
        </View>
        <View style={styles.examDetails}>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              {format(new Date(item.date), 'MMM dd, yyyy')} at {item.time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              Duration: {item.duration} minutes
            </Text>
          </View>
          {item.status === 'completed' && item.score !== undefined && (
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                Score:
              </Text>
              <Text style={[styles.scoreValue, { color: theme.colors.primary, ...theme.typography.h3 }]}>
                {item.score}% ({item.grade})
              </Text>
            </View>
          )}
        </View>
        {item.status === 'upcoming' && (
          <Button
            title="View Details"
            onPress={() => router.push(`/exams/${item.id}`)}
            variant="outline"
            size="small"
            style={styles.viewButton}
          />
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
            Exams
          </Text>
          <TouchableOpacity>
            <Icon name="search" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filter === 'upcoming' ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === 'upcoming' ? '#FFFFFF' : theme.colors.textPrimary,
                ...theme.typography.body,
              },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filter === 'past' ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setFilter('past')}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === 'past' ? '#FFFFFF' : theme.colors.textPrimary,
                ...theme.typography.body,
              },
            ]}
          >
            Past Exams
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredExams}
        renderItem={renderExamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="quiz" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
              No exams found
            </Text>
          </View>
        }
      />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  examCard: {
    marginBottom: 12,
    padding: 16,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examInfo: {
    flex: 1,
    marginRight: 12,
  },
  examName: {
    marginBottom: 8,
  },
  examMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  examMetaText: {
    marginLeft: 4,
  },
  examDetails: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    marginLeft: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  scoreLabel: {
    fontWeight: '600',
  },
  scoreValue: {
    fontWeight: '700',
  },
  viewButton: {
    marginTop: 12,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
  },
});

