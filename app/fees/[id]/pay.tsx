import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useGetFeesByIdQuery, useUpdateFeesMutation, useApplyRoundFigureFeesMutation } from '@/services/api/feesApi';

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
  { id: 'upi', name: 'UPI', icon: 'account-balance-wallet' },
  { id: 'netbanking', name: 'Net Banking', icon: 'account-balance' },
];

export default function PaymentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  // Fetch fee details
  const {
    data: feeData,
    isLoading: feeLoading,
    error: feeError,
  } = useGetFeesByIdQuery(id as string, { skip: !id });

  const [updateFees, { isLoading: updating }] = useUpdateFeesMutation();
  const [applyRoundFigure, { isLoading: applyingRoundFigure }] = useApplyRoundFigureFeesMutation();

  const fee = feeData?.data;
  const loading = feeLoading || updating || applyingRoundFigure;
  const [showRoundFigure, setShowRoundFigure] = useState(false);
  const [roundFigureAmount, setRoundFigureAmount] = useState('');

  const handleApplyRoundFigure = async () => {
    if (!roundFigureAmount || !id) {
      Alert.alert('Error', 'Please enter a round figure amount');
      return;
    }

    const amount = parseFloat(roundFigureAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await applyRoundFigure({
        feesId: id as string,
        roundFigureAmount: amount,
      }).unwrap();
      
      Alert.alert('Success', 'Round figure applied successfully');
      setShowRoundFigure(false);
      setRoundFigureAmount('');
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to apply round figure');
    }
  };

  const handlePay = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!id) {
      Alert.alert('Error', 'Fee ID is missing');
      return;
    }

    try {
      await updateFees(id as string).unwrap();
      
      Alert.alert('Success', 'Payment processed successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          Payment
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {feeLoading ? (
        <LoadingSpinner />
      ) : feeError || !fee ? (
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.colors.error }}>Error loading fee details</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                Payment Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                  Fee Type
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                  {fee.fees?.[0]?.type || 'Library Fee'}
                </Text>
              </View>
              {fee.dueDate && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                    Due Date
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                    {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                  Total Amount
                </Text>
                <Text style={[styles.totalAmount, { color: theme.colors.primary, ...theme.typography.h2 }]}>
                  ${(fee.amount || fee.fees?.[0]?.amount || 0).toFixed(2)}
                </Text>
              </View>
            </Card>

            <Card style={styles.methodsCard}>
              <Text style={[styles.methodsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                Select Payment Method
              </Text>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodItem,
                    {
                      backgroundColor: selectedMethod === method.id ? theme.colors.primary + '10' : theme.colors.surface,
                      borderColor: selectedMethod === method.id ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={styles.methodLeft}>
                    <Icon name={method.icon} size={24} color={theme.colors.primary} />
                    <Text style={[styles.methodName, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                      {method.name}
                    </Text>
                  </View>
                  {selectedMethod === method.id && (
                    <Icon name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </Card>

            <Card style={styles.methodsCard}>
              <View style={styles.roundFigureHeader}>
                <Text style={[styles.methodsTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                  Round Figure Adjustment
                </Text>
                <Button
                  title={showRoundFigure ? 'Cancel' : 'Apply Round Figure'}
                  onPress={() => {
                    setShowRoundFigure(!showRoundFigure);
                    setRoundFigureAmount('');
                  }}
                  variant="outline"
                  size="small"
                />
              </View>
              {showRoundFigure && (
                <View style={styles.roundFigureContent}>
                  <Text style={[styles.roundFigureLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                    Enter round figure amount:
                  </Text>
                  <TextInput
                    style={[
                      styles.roundFigureInput,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        color: theme.colors.textPrimary,
                      },
                    ]}
                    placeholder="Enter amount"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={roundFigureAmount}
                    onChangeText={setRoundFigureAmount}
                    keyboardType="numeric"
                  />
                  <Button
                    title="Apply"
                    onPress={handleApplyRoundFigure}
                    variant="primary"
                    loading={applyingRoundFigure}
                    style={styles.roundFigureButton}
                  />
                </View>
              )}
            </Card>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            <View style={styles.footerRow}>
              <View>
                <Text style={[styles.footerLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                  Amount to Pay
                </Text>
                <Text style={[styles.footerAmount, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                  ${(fee.amount || fee.fees?.[0]?.amount || 0).toFixed(2)}
                </Text>
              </View>
              <Button
                title="Pay Now"
                onPress={handlePay}
                variant="primary"
                loading={loading}
                disabled={!selectedMethod || fee.status === 'paid'}
                style={styles.payButton}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  summaryCard: {
    marginBottom: 16,
    padding: 20,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalAmount: {
    fontWeight: '700',
  },
  methodsCard: {
    marginBottom: 16,
    padding: 20,
  },
  methodsTitle: {
    marginBottom: 16,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodName: {
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    marginBottom: 4,
  },
  footerAmount: {
    fontWeight: '700',
  },
  payButton: {
    minWidth: 120,
  },
  roundFigureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roundFigureContent: {
    marginTop: 12,
  },
  roundFigureLabel: {
    marginBottom: 8,
  },
  roundFigureInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
  },
  roundFigureButton: {
    width: '100%',
  },
});

