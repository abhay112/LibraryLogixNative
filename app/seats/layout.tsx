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
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Mock seat grid
const generateSeatGrid = (rows: number, cols: number) => {
  const seats = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      seats.push({
        id: `${String.fromCharCode(65 + row)}-${col + 1}`,
        row: String.fromCharCode(65 + row),
        col: col + 1,
        status: 'available' as const,
      });
    }
  }
  return seats;
};

export default function SeatLayoutEditorScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [seats, setSeats] = useState(generateSeatGrid(5, 8));
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSeatPress = (seatId: string) => {
    if (previewMode) return;
    setSelectedSeat(seatId);
  };

  const handleUpdateLayout = () => {
    setSeats(generateSeatGrid(rows, cols));
  };

  const handleSave = () => {
    // TODO: Save layout
    router.back();
  };

  const renderSeat = ({ item }: { item: typeof seats[0] }) => {
    const isSelected = selectedSeat === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.seat,
          {
            backgroundColor: isSelected
              ? theme.colors.primary
              : item.status === 'available'
              ? theme.colors.success + '20'
              : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
        ]}
        onPress={() => handleSeatPress(item.id)}
      >
        <Text
          style={[
            styles.seatText,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
              ...theme.typography.caption,
            },
          ]}
        >
          {item.id}
        </Text>
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
          Seat Layout Editor
        </Text>
        <TouchableOpacity onPress={() => setPreviewMode(!previewMode)}>
          <Icon
            name={previewMode ? 'edit' : 'visibility'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {!previewMode && (
        <Card style={styles.configCard}>
          <Text style={[styles.configTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
            Layout Configuration
          </Text>
          <View style={styles.configRow}>
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Rows
              </Text>
              <Input
                value={rows.toString()}
                onChangeText={(text) => setRows(parseInt(text) || 1)}
                keyboardType="number-pad"
                style={styles.configInput}
              />
            </View>
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Columns
              </Text>
              <Input
                value={cols.toString()}
                onChangeText={(text) => setCols(parseInt(text) || 1)}
                keyboardType="number-pad"
                style={styles.configInput}
              />
            </View>
            <Button
              title="Update"
              onPress={handleUpdateLayout}
              variant="outline"
              size="small"
              style={styles.updateButton}
            />
          </View>
        </Card>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.seatsContainer}>
        <FlatList
          data={seats}
          renderItem={renderSeat}
          keyExtractor={(item) => item.id}
          numColumns={cols}
          scrollEnabled={false}
          contentContainerStyle={styles.seatsGrid}
        />
      </ScrollView>

      {!previewMode && (
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <Button
            title="Save Layout"
            onPress={handleSave}
            variant="primary"
            style={styles.saveButton}
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
  configCard: {
    margin: 16,
    padding: 16,
  },
  configTitle: {
    marginBottom: 16,
  },
  configRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  configItem: {
    flex: 1,
  },
  configLabel: {
    marginBottom: 8,
  },
  configInput: {
    marginBottom: 0,
  },
  updateButton: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
  },
  seatsContainer: {
    padding: 16,
  },
  seatsGrid: {
    gap: 8,
  },
  seat: {
    width: '11%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    margin: '0.5%',
  },
  seatText: {
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    width: '100%',
  },
});

