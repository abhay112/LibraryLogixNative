import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { FormSection } from '@/components/FormSection';
import { ButtonGroup } from '@/components/ButtonGroup';
import { useCreateInventoryMutation } from '@/services/api/inventoryApi';

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

export default function CreateInventoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'EQUIPMENT' | 'FURNITURE' | 'STATIONERY' | 'ELECTRONICS' | 'BOOKS' | 'OTHER'>('EQUIPMENT');
  const [condition, setCondition] = useState<'GOOD' | 'NEEDS_REPAIR' | 'DAMAGED' | 'DISPOSED'>('GOOD');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');

  const [createInventory, { isLoading: loading }] = useCreateInventoryMutation();

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    if (!user?._id && !user?.id || !user?.libraryId) {
      Alert.alert('Error', 'User information is missing');
      return;
    }

    try {
      await createInventory({
        name,
        category,
        condition,
        adminId: user._id || user.id || '',
        libraryId: user.libraryId || '',
        quantity: quantity ? parseInt(quantity) : undefined,
        location: location || undefined,
      }).unwrap();
      
      Alert.alert('Success', 'Inventory item created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to create inventory item. Please try again.');
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Item Name *"
          placeholder="Enter item name"
          value={name}
          onChangeText={setName}
          leftIcon="inventory"
        />

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
          label="Quantity (Optional)"
          placeholder="Enter quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          leftIcon="numbers"
        />

        <Input
          label="Location (Optional)"
          placeholder="Enter location"
          value={location}
          onChangeText={setLocation}
          leftIcon="location-on"
        />

        <Button
          title="Create Item"
          onPress={handleSubmit}
          variant="primary"
          loading={loading}
          style={styles.submitButton}
        />
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
  submitButton: {
    marginTop: 24,
  },
});

