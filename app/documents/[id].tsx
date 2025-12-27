import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import {
  useGetDocumentByIdQuery,
  useVerifyDocumentMutation,
  useDeleteDocumentMutation,
} from '@/services/api/documentsApi';

export default function DocumentDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    data: documentData,
    isLoading: documentLoading,
    error: documentError,
    refetch: refetchDocument,
  } = useGetDocumentByIdQuery(id as string, { skip: !id });

  const [verifyDocument, { isLoading: verifying }] = useVerifyDocumentMutation();
  const [deleteDocument, { isLoading: deleting }] = useDeleteDocumentMutation();

  const document = documentData?.data;

  const handleVerify = async () => {
    try {
      await verifyDocument(id as string).unwrap();
      Alert.alert('Success', 'Document verified successfully');
      refetchDocument();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to verify document');
    }
  };

  const handleView = async () => {
    if (document?.fileUrl) {
      try {
        const supported = await Linking.canOpenURL(document.fileUrl);
        if (supported) {
          await Linking.openURL(document.fileUrl);
        } else {
          Alert.alert('Error', 'Cannot open this file URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open file');
      }
    } else {
      Alert.alert('Info', 'Document file is not available');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(id as string).unwrap();
              Alert.alert('Success', 'Document deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  if (documentLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (documentError || !document) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="error-outline"
          title="Error loading document"
          message="Please try again later"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Document Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="description" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.infoSection}>
              <Text style={[styles.documentType, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {document.documentType || 'Document'}
              </Text>
              <Badge
                label={document.isVerified ? 'Verified' : 'Pending'}
                variant={document.isVerified ? 'success' : 'warning'}
              />
            </View>
          </View>

          {document.studentId && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Student ID:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{document.studentId}</Text>
            </View>
          )}

          {document.expiryDate && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Expiry Date:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {format(new Date(document.expiryDate), 'MMM dd, yyyy')}
              </Text>
            </View>
          )}

          {document.uploadedAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Uploaded:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {format(new Date(document.uploadedAt), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}

          {document.verifiedAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Verified:</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {format(new Date(document.verifiedAt), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}
        </Card>

        {/* Actions */}
        {user?.role === 'admin' && (
          <Card style={styles.actionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Actions
            </Text>
            <View style={styles.actionButtons}>
              {document.fileUrl && (
                <Button
                  title="View Document"
                  onPress={handleView}
                  variant="primary"
                  style={styles.actionButton}
                />
              )}
              {!document.isVerified && (
                <Button
                  title="Verify Document"
                  onPress={handleVerify}
                  variant="primary"
                  loading={verifying}
                  style={styles.actionButton}
                />
              )}
              <Button
                title="Delete Document"
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
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
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
  documentType: {
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
  actionsCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});

