import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetReportByIdQuery, useDeleteReportMutation } from '@/services/api/reportsApi';
import type { ReportStatus } from '@/services/api/reportsApi';

const statusColors: Record<ReportStatus, 'success' | 'warning' | 'error' | 'info'> = {
  COMPLETED: 'success',
  GENERATING: 'warning',
  PENDING: 'info',
  FAILED: 'error',
};

export default function ReportDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    data: reportData,
    isLoading: reportLoading,
    error: reportError,
  } = useGetReportByIdQuery(id as string, { skip: !id });

  const [deleteReport, { isLoading: deleting }] = useDeleteReportMutation();

  const report = reportData?.data;

  const handleDownload = async () => {
    if (report?.fileUrl) {
      try {
        const supported = await Linking.canOpenURL(report.fileUrl);
        if (supported) {
          await Linking.openURL(report.fileUrl);
        } else {
          Alert.alert('Error', 'Cannot open this file URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open file');
      }
    } else {
      Alert.alert('Info', 'Report file is not available yet');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReport(id as string).unwrap();
              Alert.alert('Success', 'Report deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  if (reportLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (reportError || !report) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="error-outline"
          title="Error loading report"
          message="Please try again later"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Report Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={styles.infoSection}>
              <Text style={[styles.reportType, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {report.reportType.replace('_', ' ')}
              </Text>
              {report.createdAt && (
                <Text style={[styles.date, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Created: {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}
                </Text>
              )}
            </View>
            <Badge
              label={report.status}
              variant={statusColors[report.status] || 'info'}
            />
          </View>

          {report.startDate && report.endDate && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Period:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {format(new Date(report.startDate), 'MMM dd, yyyy')} - {format(new Date(report.endDate), 'MMM dd, yyyy')}
              </Text>
            </View>
          )}

          {report.errorMessage && (
            <View style={styles.errorSection}>
              <Text style={[styles.errorLabel, { color: theme.colors.error }]}>Error:</Text>
              <Text style={[styles.errorMessage, { color: theme.colors.error }]}>
                {report.errorMessage}
              </Text>
            </View>
          )}
        </Card>

        {/* Actions */}
        {report.status === 'COMPLETED' && report.fileUrl && (
          <Card style={styles.actionsCard}>
              <Button
                title="Download Report"
                onPress={handleDownload}
                variant="primary"
                style={styles.downloadButton}
              />
          </Card>
        )}

        {report.status === 'FAILED' && (
          <Card style={styles.actionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Report Generation Failed
            </Text>
            <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
              This report could not be generated. Please try creating a new report.
            </Text>
          </Card>
        )}

        {report.status === 'GENERATING' && (
          <Card style={styles.actionsCard}>
            <View style={styles.generatingContainer}>
              <LoadingSpinner />
              <Text style={[styles.generatingText, { color: theme.colors.textSecondary }]}>
                Report is being generated. Please check back later.
              </Text>
            </View>
          </Card>
        )}

        <Card style={styles.actionsCard}>
          <Button
            title="Delete Report"
            onPress={handleDelete}
            variant="error"
            loading={deleting}
            style={styles.deleteButton}
          />
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoSection: {
    flex: 1,
    marginRight: 12,
  },
  reportType: {
    marginBottom: 4,
    fontWeight: '600',
  },
  date: {
    marginTop: 4,
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
  errorSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  downloadButton: {
    width: '100%',
  },
  deleteButton: {
    width: '100%',
  },
  generatingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  generatingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    lineHeight: 20,
  },
});

