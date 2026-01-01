import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { SeatLayoutViewer } from '@/components/SeatLayoutViewer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGetSeatLayoutQuery } from '@/services/api/seatLayoutApi';

// Default empty layout structure
const defaultLayout: any = {
  name: 'New Layout',
  categories: [
    {
      id: 'cat-1',
      name: 'Standard',
      color: '#000000',
      textColor: '#f7f7f7',
    },
  ],
  sections: [
    {
      id: 'sec-1',
      name: 'Section 1',
      color: '#000000',
      stroke: '#000000',
      freeSeating: false,
    },
  ],
  seats: [],
  text: [],
  shapes: [],
  polylines: [],
  images: [],
  workspace: {
    initialViewBoxScale: undefined,
    initialViewBoxScaleForWidth: undefined,
    visibilityOffset: 0,
    airplaneMode: false,
  },
};

export default function SeatLayoutEditorScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [layoutData, setLayoutData] = useState(defaultLayout);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  // Determine the back route based on user role
  const getBackRoute = () => {
    if (user?.role === 'admin') {
      return '/admin/seats';
    }
    return '/student/seats';
  };

  const handleBack = () => {
    const backRoute = getBackRoute();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(backRoute as any);
    }
  };

  // Fetch existing layout if available
  const {
    data: seatLayoutData,
    isLoading: loading,
  } = useGetSeatLayoutQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
    },
    {
      skip: (!user?._id && !user?.id) || !user?.libraryId,
    }
  );

  useEffect(() => {
    // If layout data exists from API, use it
    const layoutDataFromApi = (seatLayoutData?.seatLayout as any)?.layoutData;
    if (layoutDataFromApi) {
      setLayoutData(layoutDataFromApi);
    }
  }, [seatLayoutData]);

  const handleSeatPress = (seat: any) => {
    setSelectedSeatId(seat.id);
    Alert.alert('Seat Selected', `Seat ${seat.label} - ${seat.status}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Seat Layout
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <SeatLayoutViewer
        layoutJson={layoutData}
        onSeatPress={handleSeatPress}
        selectedSeatId={selectedSeatId}
        style={styles.viewer}
      />
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
    fontSize: 18,
    fontWeight: '700',
  },
  viewer: {
    flex: 1,
  },
});

