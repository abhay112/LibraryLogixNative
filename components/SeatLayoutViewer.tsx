import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Rect,
  Text as SvgText,
  Polygon,
  G,
} from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Seat {
  id: string;
  x: number;
  y: number;
  label: string;
  status: string;
  category: string | null;
  square?: boolean;
  rotation?: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

interface Section {
  id: string;
  name: string;
  color: string;
  stroke: string;
  freeSeating: boolean;
}

interface LayoutJson {
  name: string;
  categories: Category[];
  sections: Section[];
  seats: Seat[];
  text?: Array<{
    id: string;
    x: number;
    y: number;
    label: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    rotation?: number;
  }>;
  shapes?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rx?: number;
    color?: string;
    stroke?: string;
    rotation?: number;
  }>;
  polylines?: Array<{
    id: string;
    points: Array<{ x: number; y: number }>;
    section?: string;
    color?: string;
    stroke?: string;
  }>;
  workspace?: {
    initialViewBoxScale?: number;
    visibilityOffset?: number;
  };
}

interface SeatLayoutViewerProps {
  layoutJson: LayoutJson;
  onSeatPress?: (seat: Seat) => void;
  selectedSeatId?: string | null;
  style?: any;
}

export const SeatLayoutViewer: React.FC<SeatLayoutViewerProps> = ({
  layoutJson,
  onSeatPress,
  selectedSeatId,
  style,
}) => {
  const { theme } = useTheme();
  const [showLegend, setShowLegend] = useState(false);
  const [selectedSeatInfo, setSelectedSeatInfo] = useState<Seat | null>(null);
  const [seats, setSeats] = useState<Seat[]>(layoutJson.seats || []);

  // Safety check for theme
  if (!theme || !theme.colors) {
    console.warn('Theme not available in SeatLayoutViewer');
    return null;
  }

  // Sync seats with layoutJson when it changes
  React.useEffect(() => {
    setSeats(layoutJson.seats || []);
  }, [layoutJson.seats]);

  // Pan and zoom state
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Calculate viewBox dimensions
  const getViewBoxDimensions = () => {
    if (!layoutJson.seats || layoutJson.seats.length === 0) {
      return { minX: 0, minY: 0, width: 800, height: 600 };
    }

    const xs = layoutJson.seats.map((s) => s.x);
    const ys = layoutJson.seats.map((s) => s.y);
    const minX = Math.min(...xs) - 100;
    const minY = Math.min(...ys) - 100;
    const maxX = Math.max(...xs) + 100;
    const maxY = Math.max(...ys) + 100;

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  const viewBox = getViewBoxDimensions();

  // Pan gesture (for canvas panning)
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX / scale.value;
      translateY.value = savedTranslateY.value + e.translationY / scale.value;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(3, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Handle seat press function - must be defined before gestures
  const handleSeatPress = useCallback((seat: Seat) => {
    setSelectedSeatInfo(seat);
    if (onSeatPress) {
      onSeatPress(seat);
    }
  }, [onSeatPress]);

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = useCallback((screenX: number, screenY: number) => {
    const currentScale = scale.value;
    const currentTranslateX = translateX.value;
    const currentTranslateY = translateY.value;
    
    const svgX = ((screenX - SCREEN_WIDTH / 2) / currentScale - currentTranslateX) * (viewBox.width / SCREEN_WIDTH) + (viewBox.minX + viewBox.width / 2);
    const svgY = ((screenY - SCREEN_HEIGHT / 2) / currentScale - currentTranslateY) * (viewBox.height / SCREEN_HEIGHT) + (viewBox.minY + viewBox.height / 2);
    
    return { x: svgX, y: svgY };
  }, [viewBox]);

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      const svgCoords = screenToSvg(e.x, e.y);
      
      // Find and select nearest seat
      if (onSeatPress && seats.length > 0) {
        let nearestSeat: Seat | null = null;
        let minDist = Infinity;

        seats.forEach((seat) => {
          const dist = Math.sqrt(
            Math.pow(seat.x - svgCoords.x, 2) + Math.pow(seat.y - svgCoords.y, 2)
          );
          if (dist < minDist && dist < 40) {
            minDist = dist;
            nearestSeat = seat;
          }
        });

        if (nearestSeat) {
          runOnJS(handleSeatPress)(nearestSeat);
        }
      }
    });

  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    tapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const getSeatColor = (seat: Seat): string => {
    if (seat.category) {
      const category = layoutJson.categories.find((c) => c.id === seat.category);
      return category?.color || theme.colors.border;
    }

    switch (seat.status) {
      case 'Available':
      case 'VACANT':
      case 'BLANK':
        return theme.colors.success;
      case 'Reserved':
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

  const getSeatTextColor = (seat: Seat): string => {
    if (seat.category) {
      const category = layoutJson.categories.find((c) => c.id === seat.category);
      return category?.textColor || '#FFFFFF';
    }
    return '#FFFFFF';
  };

  const resetView = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    savedScale.value = 1;
  };

  // Platform-specific shadow styles
  const controlsShadowStyle = Platform.OS === 'web' 
    ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      };

  return (
    <View style={[styles.container, style]}>
      {/* Controls */}
      <View style={[styles.controls, controlsShadowStyle, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => setShowLegend(!showLegend)}
          style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
        >
          <Icon name="info" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={resetView}
          style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
        >
          <Icon name="center-focus-strong" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* SVG Layout */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.svgContainer, animatedStyle]}>
          <Svg
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Render sections background */}
            {layoutJson.sections.map((section) => (
              <Rect
                key={section.id}
                x={viewBox.minX}
                y={viewBox.minY}
                width={viewBox.width}
                height={viewBox.height}
                fill={section.color + '20'}
                opacity={0.3}
              />
            ))}

            {/* Render shapes */}
            {layoutJson.shapes?.map((shape) => (
              <Rect
                key={shape.id}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx || 0}
                fill={shape.color || 'transparent'}
                stroke={shape.stroke || theme.colors.border}
                strokeWidth={2}
                transform={`rotate(${shape.rotation || 0} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})`}
              />
            ))}

            {/* Render polylines */}
            {layoutJson.polylines?.map((polyline) => (
              <Polygon
                key={polyline.id}
                points={polyline.points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={polyline.color || 'transparent'}
                stroke={polyline.stroke || theme.colors.border}
                strokeWidth={2}
              />
            ))}

            {/* Render seats */}
            {seats.map((seat) => {
              const isSelected = selectedSeatId === seat.id;
              const seatColor = getSeatColor(seat);
              const textColor = getSeatTextColor(seat);

              return (
                <G key={seat.id}>
                  {seat.square ? (
                    <Rect
                      x={seat.x - 20}
                      y={seat.y - 20}
                      width={40}
                      height={40}
                      fill={seatColor}
                      stroke={isSelected ? theme.colors.primary : 'transparent'}
                      strokeWidth={isSelected ? 3 : 0}
                    />
                  ) : (
                    <Circle
                      cx={seat.x}
                      cy={seat.y}
                      r={20}
                      fill={seatColor}
                      stroke={isSelected ? theme.colors.primary : 'transparent'}
                      strokeWidth={isSelected ? 3 : 0}
                    />
                  )}
                  <SvgText
                    x={seat.x}
                    y={seat.y + 5}
                    fontSize={14}
                    fontWeight="bold"
                    fill={textColor}
                    textAnchor="middle"
                  >
                    {seat.label}
                  </SvgText>
                </G>
              );
            })}

            {/* Render text labels */}
            {layoutJson.text?.map((textItem) => (
              <SvgText
                key={textItem.id}
                x={textItem.x}
                y={textItem.y}
                fontSize={textItem.fontSize || 16}
                fontWeight={textItem.fontWeight || 400}
                fill={textItem.color || theme.colors.textPrimary}
                transform={`rotate(${textItem.rotation || 0} ${textItem.x} ${textItem.y})`}
              >
                {textItem.label}
              </SvgText>
            ))}
          </Svg>
        </Animated.View>
      </GestureDetector>

      {/* Legend Modal */}
      <Modal
        visible={showLegend}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLegend(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                Legend
              </Text>
              <TouchableOpacity onPress={() => setShowLegend(false)}>
                <Icon name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {/* Categories */}
              {layoutJson.categories.length > 0 && (
                <View style={styles.legendSection}>
                  <Text style={[styles.legendSectionTitle, { color: theme.colors.textPrimary }]}>
                    Categories
                  </Text>
                  {layoutJson.categories.map((category) => (
                    <View key={category.id} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                        {category.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Status */}
              <View style={styles.legendSection}>
                <Text style={[styles.legendSectionTitle, { color: theme.colors.textPrimary }]}>
                  Status
                </Text>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: theme.colors.success }]}
                  />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                    Available
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: theme.colors.error }]}
                  />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                    Occupied/Reserved
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: theme.colors.warning }]}
                  />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                    Fixed
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: theme.colors.textSecondary },
                    ]}
                  />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                    Blocked
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Seat Info Modal */}
      {selectedSeatInfo && (
        <Modal
          visible={!!selectedSeatInfo}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedSeatInfo(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedSeatInfo(null)}
          >
            <View
              style={[styles.seatInfoModal, { backgroundColor: theme.colors.surface }]}
              onStartShouldSetResponder={() => true}
            >
              <Text style={[styles.seatInfoTitle, { color: theme.colors.textPrimary }]}>
                Seat {selectedSeatInfo.label}
              </Text>
              <Text style={[styles.seatInfoText, { color: theme.colors.textSecondary }]}>
                Status: {selectedSeatInfo.status}
              </Text>
              {selectedSeatInfo.category && (
                <Text style={[styles.seatInfoText, { color: theme.colors.textSecondary }]}>
                  Category:{' '}
                  {layoutJson.categories.find((c) => c.id === selectedSeatInfo.category)?.name ||
                    'Unknown'}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setSelectedSeatInfo(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  svgContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  controls: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  legendSection: {
    marginBottom: 24,
  },
  legendSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
  },
  seatInfoModal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  seatInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  seatInfoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Also export as default for compatibility
export default SeatLayoutViewer;

