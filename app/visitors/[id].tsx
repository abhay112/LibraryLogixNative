import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetVisitorByIdQuery } from '@/services/api/visitorsApi';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  ACTIVE: 'success',
  EXITED: 'info',
  EXPIRED: 'error',
};

export default function VisitorDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    data: visitorData,
    isLoading: visitorLoading,
    error: visitorError,
  } = useGetVisitorByIdQuery(id as string, { skip: !id });

  const visitor = visitorData?.data;

  if (visitorLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (visitorError || !visitor) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="error-outline"
          title="Error loading visitor"
          message="Please try again later"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Visitor Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="person" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.infoSection}>
              <Text style={[styles.name, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {visitor.name}
              </Text>
              <Badge
                label={visitor.status}
                variant={statusColors[visitor.status] || 'info'}
              />
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mobile:</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{visitor.mobile}</Text>
          </View>

          {visitor.email && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{visitor.email}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Purpose:</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{visitor.purpose}</Text>
          </View>

          {visitor.entryTime && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Entry Time:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {format(new Date(visitor.entryTime), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}

          {visitor.exitTime && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Exit Time:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {format(new Date(visitor.exitTime), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}

          {visitor.notes && (
            <View style={styles.notesSection}>
              <Text style={[styles.notesLabel, { color: theme.colors.textSecondary }]}>Notes:</Text>
              <Text style={[styles.notesValue, { color: theme.colors.textPrimary }]}>{visitor.notes}</Text>
            </View>
          )}
        </Card>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoSection: {
    flex: 1,
    gap: 8,
  },
  name: {
    marginBottom: 4,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesValue: {
    fontSize: 14,
    lineHeight: 20,
  },
});

