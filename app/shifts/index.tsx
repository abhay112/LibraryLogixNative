import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useGetShiftsQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} from '@/services/api/shiftsApi';

export default function ShiftsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const {
    data: shiftsData,
    isLoading: shiftsLoading,
    error: shiftsError,
    refetch: refetchShifts,
  } = useGetShiftsQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
      isActive: true,
    },
    { skip: (!user?._id && !user?.id) || !user?.libraryId }
  );

  const [createShift] = useCreateShiftMutation();
  const [updateShift] = useUpdateShiftMutation();
  const [deleteShift] = useDeleteShiftMutation();

  const shifts = shiftsData?.data || [];

  const handleOpenModal = (shift?: any) => {
    if (shift) {
      setEditingShift(shift);
      setName(shift.name);
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
    } else {
      setEditingShift(null);
      setName('');
      setStartTime('');
      setEndTime('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShift(null);
    setName('');
    setStartTime('');
    setEndTime('');
  };

  const handleSubmit = async () => {
    if (!name || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      if (editingShift) {
        await updateShift({
          id: editingShift._id,
          data: { name, startTime, endTime },
        }).unwrap();
        Alert.alert('Success', 'Shift updated successfully');
      } else {
        await createShift({
          adminId: user._id || user.id || '',
          libraryId: user.libraryId || '',
          name,
          startTime,
          endTime,
          isActive: true,
        }).unwrap();
        Alert.alert('Success', 'Shift created successfully');
      }
      handleCloseModal();
      refetchShifts();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to save shift');
    }
  };

  const handleDelete = (shiftId: string) => {
    Alert.alert(
      'Delete Shift',
      'Are you sure you want to delete this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShift(shiftId).unwrap();
              Alert.alert('Success', 'Shift deleted successfully');
              refetchShifts();
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete shift');
            }
          },
        },
      ]
    );
  };

  const renderShiftItem = ({ item }: { item: any }) => (
    <Card style={styles.shiftCard}>
      <View style={styles.shiftHeader}>
        <View style={styles.shiftInfo}>
          <Text style={[styles.shiftName, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            {item.name}
          </Text>
          <Text style={[styles.shiftTime, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
        <Badge
          label={item.isActive ? 'Active' : 'Inactive'}
          variant={item.isActive ? 'success' : 'info'}
        />
      </View>
      <View style={styles.shiftActions}>
        <Button
          title="Edit"
          onPress={() => handleOpenModal(item)}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={() => handleDelete(item._id)}
          variant="outline"
          size="small"
          style={[styles.actionButton, { borderColor: theme.colors.error }]}
          textStyle={{ color: theme.colors.error }}
        />
      </View>
    </Card>
  );

  return (
    <ScreenWrapper>
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader
          title="Shifts"
          rightAction={
            <TouchableOpacity onPress={() => handleOpenModal()}>
              <Icon name="add-circle" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
          }
        />

        {shiftsLoading ? (
          <LoadingSpinner />
        ) : shiftsError ? (
          <EmptyState
            icon="error-outline"
            title="Error loading shifts"
            message="Please try again later"
          />
        ) : (
          <FlatList
            data={shifts}
            renderItem={renderShiftItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            onRefresh={refetchShifts}
            refreshing={false}
            ListEmptyComponent={
              <EmptyState
                icon="schedule"
                title="No shifts found"
                message="Create your first shift to get started"
              />
            }
          />
        )}

        {/* Create/Edit Modal */}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
                  {editingShift ? 'Edit Shift' : 'Create Shift'}
                </Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Icon name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Input
                label="Shift Name"
                placeholder="e.g., Morning Shift"
                value={name}
                onChangeText={setName}
                leftIcon="schedule"
              />

              <Input
                label="Start Time (HH:mm)"
                placeholder="e.g., 06:00"
                value={startTime}
                onChangeText={setStartTime}
                leftIcon="access-time"
              />

              <Input
                label="End Time (HH:mm)"
                placeholder="e.g., 12:00"
                value={endTime}
                onChangeText={setEndTime}
                leftIcon="access-time"
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title={editingShift ? 'Update' : 'Create'}
                  onPress={handleSubmit}
                  variant="primary"
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  shiftCard: {
    marginBottom: 12,
    padding: 16,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  shiftTime: {
    marginTop: 2,
  },
  shiftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});

