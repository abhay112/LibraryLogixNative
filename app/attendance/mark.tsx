import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import {
  useGetAttendanceByDateQuery,
  useAssignSeatMutation,
  useCreateAttendanceMutation,
} from '@/services/api/attendanceApi';

export default function MarkAttendanceScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);

  // Fetch attendance data for today
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useGetAttendanceByDateQuery(
    {
      date: today,
      adminId: user?._id || user?.id || '',
    },
    { skip: (!user?._id && !user?.id) }
  );

  const [createAttendance] = useCreateAttendanceMutation();
  const [assignSeat, { isLoading: assigning }] = useAssignSeatMutation();

  const seats = attendanceData?.data?.seats || [];
  const attendance = attendanceData?.data?.attendance;

  // Create attendance record if it doesn't exist
  React.useEffect(() => {
    if (!attendance && user?._id && user?.libraryId && !attendanceLoading) {
      createAttendance({
        libraryId: user.libraryId,
        adminId: user._id || user.id || '',
      }).then(() => {
        refetchAttendance();
      });
    }
  }, [attendance, user, attendanceLoading]);

  const handleCheckIn = async () => {
    if (!selectedSeatNumber) {
      Alert.alert('Error', 'Please select a seat');
      return;
    }

    if (!user?._id && !user?.id) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    // For student check-in, we need studentId - this would come from auth context
    // For now, using a placeholder - in real app, get from user context
    const studentId = user?.id || user?._id || '';

    try {
      await assignSeat({
        adminId: user._id || user.id || '',
        seatNumber: selectedSeatNumber,
        studentId,
      }).unwrap();
      
      Alert.alert('Success', 'Attendance marked successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to mark attendance. Please try again.');
    }
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'VACANT':
      case 'BLANK':
        return theme.colors.success;
      case 'FILLED':
        return theme.colors.error;
      case 'FIXED':
        return theme.colors.warning;
      case 'BLOCKED':
        return theme.colors.textSecondary;
      default:
        return theme.colors.border;
    }
  };

  const isSeatAvailable = (seat: any) => {
    return seat.status === 'VACANT' || seat.status === 'BLANK';
  };

  const renderSeat = ({ item }: { item: any }) => {
    const isSelected = selectedSeatNumber === item.seatNumber;
    const isAvailable = isSeatAvailable(item);
    const seatColor = getSeatColor(item.status);

    return (
      <TouchableOpacity
        style={[
          styles.seat,
          {
            backgroundColor: isSelected
              ? theme.colors.primary
              : item.status === 'available'
              ? seatColor + '20'
              : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : seatColor,
            borderWidth: 2,
          },
        ]}
        onPress={() => isAvailable && setSelectedSeatNumber(item.seatNumber)}
        disabled={!isAvailable}
      >
        <Text
          style={[
            styles.seatNumber,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
              ...theme.typography.body,
            },
          ]}
        >
          {item.seatNumber}
        </Text>
        {!isAvailable && (
          <Icon
            name={item.status === 'FILLED' ? 'person' : 'block'}
            size={16}
            color={seatColor}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          Mark Attendance
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="check-circle" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                Select Your Seat
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Choose an available seat to check in
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Available
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Occupied
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.warning }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Fixed
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
              Blocked
            </Text>
          </View>
        </View>

        {attendanceLoading ? (
          <LoadingSpinner />
        ) : attendanceError ? (
          <EmptyState
            icon="error-outline"
            title="Error loading seats"
            message="Please try again later"
          />
        ) : (
          <>
            <View style={styles.seatsContainer}>
              <FlatList
                data={seats}
                renderItem={renderSeat}
                keyExtractor={(item) => item._id || item.seatNumber?.toString()}
                numColumns={4}
                scrollEnabled={false}
                contentContainerStyle={styles.seatsGrid}
                ListEmptyComponent={
                  <EmptyState
                    icon="event-seat"
                    title="No seats available"
                    message="Seat layout not configured"
                  />
                }
              />
            </View>

            {selectedSeatNumber && (
              <Card style={styles.selectedCard}>
                <Text style={[styles.selectedText, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>
                  Selected: Seat {selectedSeatNumber}
                </Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <Button
          title="Check In"
          onPress={handleCheckIn}
          variant="primary"
          loading={assigning}
          disabled={!selectedSeatNumber}
          style={styles.checkInButton}
        />
      </View>
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
  infoCard: {
    margin: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontWeight: '500',
  },
  seatsContainer: {
    padding: 16,
  },
  seatsGrid: {
    gap: 12,
  },
  seat: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5%',
  },
  seatNumber: {
    fontWeight: '600',
  },
  selectedCard: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  selectedText: {
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  checkInButton: {
    width: '100%',
  },
});

