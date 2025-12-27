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
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { FormSection } from '@/components/FormSection';
import { ButtonGroup } from '@/components/ButtonGroup';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useGetInventoryItemByIdQuery,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from '@/services/api/inventoryApi';

const categories = [
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'STATIONERY', label: 'Stationery' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'OTHER', label: 'Other' },
];

const conditions = [
  { value: 'GOOD', label: 'Good' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'DISPOSED', label: 'Disposed' },
];

const categoryColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  EQUIPMENT: 'info',
  FURNITURE: 'success',
  STATIONERY: 'info',
  ELECTRONICS: 'warning',
  BOOKS: 'error',
  OTHER: 'default',
};

const conditionColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  GOOD: 'success',
  NEEDS_REPAIR: 'warning',
  DAMAGED: 'error',
  DISPOSED: 'info',
};

export default function InventoryDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'EQUIPMENT' | 'FURNITURE' | 'STATIONERY' | 'ELECTRONICS' | 'BOOKS' | 'OTHER'>('EQUIPMENT');
  const [condition, setCondition] = useState<'GOOD' | 'NEEDS_REPAIR' | 'DAMAGED' | 'DISPOSED'>('GOOD');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');

  const {
    data: itemData,
    isLoading: itemLoading,
    error: itemError,
    refetch: refetchItem,
  } = useGetInventoryItemByIdQuery(id as string, { skip: !id });

  const [updateItem, { isLoading: updating }] = useUpdateInventoryItemMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteInventoryItemMutation();

  const item = itemData?.data;

  React.useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || 'EQUIPMENT');
      setCondition(item.condition || 'GOOD');
      setLocation(item.location || '');
      setQuantity(item.quantity?.toString() || '');
      setDescription(item.description || '');
    }
  }, [item]);

  const handleUpdate = async () => {
    if (!name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateItem({
        id: id as string,
        data: {
          name,
          category,
          condition,
          location: location || undefined,
          quantity: quantity ? parseInt(quantity, 10) : undefined,
          description: description || undefined,
        },
      }).unwrap();
      
      Alert.alert('Success', 'Inventory item updated successfully');
      setIsEditing(false);
      refetchItem();
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to update inventory item');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this inventory item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(id as string).unwrap();
              Alert.alert('Success', 'Inventory item deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete inventory item');
            }
          },
        },
      ]
    );
  };

  if (itemLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (itemError || !item) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="error-outline"
          title="Error loading item"
          message="Please try again later"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Item Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="inventory" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.infoSection}>
              {isEditing ? (
                <Input
                  label="Name *"
                  value={name}
                  onChangeText={setName}
                  style={styles.editInput}
                />
              ) : (
                <Text style={[styles.name, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                  {item.name}
                </Text>
              )}
            </View>
            <View style={styles.badges}>
              <Badge
                label={item.category}
                variant={categoryColors[item.category] || 'info'}
              />
              <Badge
                label={item.condition}
                variant={conditionColors[item.condition] || 'info'}
              />
            </View>
          </View>

          {isEditing ? (
            <>
              <FormSection label="Category *">
                <ButtonGroup
                  options={categories}
                  selectedValue={category}
                  onSelect={(value) => setCategory(value as typeof category)}
                />
              </FormSection>
              <FormSection label="Condition *">
                <ButtonGroup
                  options={conditions}
                  selectedValue={condition}
                  onSelect={(value) => setCondition(value as typeof condition)}
                />
              </FormSection>
              <Input
                label="Location"
                value={location}
                onChangeText={setLocation}
                style={styles.editInput}
              />
              <Input
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.editInput}
              />
              <Input
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={styles.editInput}
              />
            </>
          ) : (
            <>
              {item.location && (
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Location:</Text>
                  <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{item.location}</Text>
                </View>
              )}
              {item.quantity !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Quantity:</Text>
                  <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{item.quantity}</Text>
                </View>
              )}
              {item.description && (
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description:</Text>
                  <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{item.description}</Text>
                </View>
              )}
            </>
          )}
        </Card>

        {/* Actions */}
        {user?.role === 'admin' && (
          <Card style={styles.actionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
              Actions
            </Text>
            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <Button
                    title="Save Changes"
                    onPress={handleUpdate}
                    variant="primary"
                    loading={updating}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setIsEditing(false);
                      // Reset form
                      setName(item.name || '');
                      setCategory(item.category || 'EQUIPMENT');
                      setCondition(item.condition || 'GOOD');
                      setLocation(item.location || '');
                      setQuantity(item.quantity?.toString() || '');
                      setDescription(item.description || '');
                    }}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                </>
              ) : (
                <>
                  <Button
                    title="Edit Item"
                    onPress={() => setIsEditing(true)}
                    variant="primary"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Delete Item"
                    onPress={handleDelete}
                    variant="error"
                    loading={deleting}
                    style={styles.actionButton}
                  />
                </>
              )}
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
  },
  name: {
    marginBottom: 4,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  editInput: {
    marginBottom: 12,
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

