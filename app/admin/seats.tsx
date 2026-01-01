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
import { DashboardHeader } from '@/components/DashboardHeader';
import { formatRole } from '@/utils/format';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { SeatLayoutViewer } from '@/components/SeatLayoutViewer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useGetSeatLayoutQuery,
} from '@/services/api/seatLayoutApi';

export default function SeatsScreen() {
  const { theme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'layout'>('layout');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  // Safety check for theme
  if (!theme || !theme.colors) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  // Fetch seat layout
  const {
    data: seatLayoutData,
    isLoading: seatLayoutLoading,
    error: seatLayoutError,
  } = useGetSeatLayoutQuery(
    {
      adminId: user?._id || user?.id || '',
      libraryId: user?.libraryId || '',
    },
    { 
      skip: (!user?._id && !user?.id) || !user?.libraryId || authLoading,
      refetchOnMountOrArgChange: true,
    }
  );

  // Extract seat layout data from response
  const seatLayout = seatLayoutData?.seatLayout;
  const layoutData = (seatLayoutData?.seatLayout as any)?.layoutData;
  
  // Seats can be in two places: direct seats array or in layoutData.seats
  const seatsFromApi = seatLayoutData?.seats || [];
  const seatsFromLayoutData = layoutData?.seats || [];
  // Prioritize layoutData.seats if it has items, otherwise use API seats
  const seats = seatsFromLayoutData.length > 0 ? seatsFromLayoutData : seatsFromApi;
  
  // Calculate stats from layoutData if available
  const calculatedTotalSeats = layoutData?.seats?.length || 0;
  const calculatedAvailableSeats = layoutData?.seats?.filter((s: any) => 
    s.status === 'Available' || s.status === 'VACANT' || s.status === 'BLANK'
  ).length || 0;
  
  // Debug: Log seat layout data
  React.useEffect(() => {
    if (seatLayoutData) {
      console.log('🪑 Seat Layout Data:', {
        hasSeatLayout: !!seatLayout,
        hasLayoutData: !!layoutData,
        hasSeatsFromApi: seatsFromApi.length > 0,
        hasSeatsFromLayoutData: seatsFromLayoutData.length > 0,
        seatsCount: seats.length,
        seatLayout: seatLayout,
        layoutDataSeats: layoutData?.seats?.length || 0,
      });
    }
  }, [seatLayoutData, seatLayout, layoutData, seats, seatsFromApi, seatsFromLayoutData]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VACANT':
        return 'Vacant';
      case 'BLANK':
        return 'Available';
      case 'FILLED':
        return 'Occupied';
      case 'FIXED':
        return 'Fixed';
      case 'BLOCKED':
        return 'Blocked';
      default:
        return status;
    }
  };

  const renderSeatItem = ({ item }: { item: any }) => {
    // Handle both API seat format and layoutData seat format
    const seatNumber = item.seatNumber || item.label || 'N/A';
    const seatStatus = item.status || 'Available';
    const seatColor = getSeatColor(seatStatus);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/seats`)}
        activeOpacity={0.7}
      >
        <Card style={styles.seatCard}>
          <View style={styles.seatHeader}>
            <View style={styles.seatInfo}>
              <Text style={[styles.seatNumber, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                {seatNumber}
              </Text>
              <Badge
                label={getStatusLabel(seatStatus)}
                variant={
                  seatStatus === 'VACANT' || seatStatus === 'BLANK' || seatStatus === 'Available'
                    ? 'success'
                    : seatStatus === 'FILLED' || seatStatus === 'Reserved'
                    ? 'error'
                    : seatStatus === 'FIXED'
                    ? 'warning'
                    : 'default'
                }
                size="small"
              />
            </View>
            <Icon name="event-seat" size={32} color={seatColor} />
          </View>
          {item.currentAssignment && (
            <View style={styles.studentInfo}>
              <Icon name="person" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.studentName, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Student ID: {item.currentAssignment.studentId}
              </Text>
            </View>
          )}
          {item.category && layoutData?.categories && (
            <View style={styles.studentInfo}>
              <Icon name="category" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.studentName, { color: theme.colors.textSecondary, ...theme.typography.body }]}>
                Category: {layoutData.categories.find((c: any) => c.id === item.category)?.name || 'Unknown'}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {user && (
        <DashboardHeader
          userName={user.name}
          userRole={formatRole(user.role)}
          notificationCount={3}
          onNotificationPress={() => router.push('/notifications')}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
      )}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
          Seats
        </Text>
        <TouchableOpacity 
          onPress={() => setViewMode(viewMode === 'list' ? 'layout' : 'list')}
          style={styles.headerButton}
        >
          <Icon 
            name={viewMode === 'list' ? 'view-module' : 'list'} 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {viewMode === 'layout' && layoutData ? (
        <View style={styles.layoutContainer}>
          <SeatLayoutViewer
            layoutJson={layoutData}
            onSeatPress={(seat) => {
              setSelectedSeatId(seat.id);
              Alert.alert('Seat Selected', `Seat ${seat.label} - ${seat.status}`);
            }}
            selectedSeatId={selectedSeatId}
            style={styles.viewer}
          />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Seat Layout Info Card */}
          {seatLayout && (
            <Card style={styles.infoCard}>
              <Text style={[styles.infoTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                Seat Layout Information
              </Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                    Total Seats
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textPrimary, ...theme.typography.h2 }]}>
                    {seatLayout.totalSeats || calculatedTotalSeats}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                    Available
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.success, ...theme.typography.h2 }]}>
                    {seatLayout.availableSeats || calculatedAvailableSeats}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                    Fixed
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.warning, ...theme.typography.h2 }]}>
                    {seatLayout.fixedSeats || 0}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                    Blocked
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.error, ...theme.typography.h2 }]}>
                    {seatLayout.blockedSeats || 0}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>
                    Layout Size
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.textPrimary, ...theme.typography.body }]}>
                    {seatLayout.rows || 0} × {seatLayout.columns || 0}
                  </Text>
                </View>
              </View>
            </Card>
          )}

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

          {seatLayoutLoading ? (
            <LoadingSpinner />
          ) : seatLayoutError ? (
            <EmptyState
              icon="error-outline"
              title="Error loading seats"
              message="Please try again later"
            />
          ) : seats.length > 0 ? (
            <View style={styles.seatsList}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, ...theme.typography.h3 }]}>
                Seats ({seats.length})
              </Text>
              <FlatList
                data={seats}
                renderItem={renderSeatItem}
                keyExtractor={(item) => item._id || item.id || item.seatNumber?.toString() || item.label}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <EmptyState
                icon="event-seat"
                title="No seats configured"
                message={seatLayout || layoutData ? "Seat layout exists but no individual seats have been created yet. Please configure seats via the backend." : "Seat layout not configured. Please create a layout via the backend."}
              />
            </Card>
          )}
        </ScrollView>
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
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
    flexWrap: 'wrap',
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
  seatsList: {
    padding: 16,
  },
  seatCard: {
    marginBottom: 12,
    padding: 16,
  },
  seatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seatNumber: {
    fontWeight: '700',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  studentName: {
    marginLeft: 4,
  },
  infoCard: {
    margin: 16,
    padding: 20,
  },
  infoTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  infoLabel: {
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '700',
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  emptyCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  layoutContainer: {
    flex: 1,
  },
  viewer: {
    flex: 1,
  },
});

