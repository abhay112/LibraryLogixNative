import React, { useState, useCallback, useRef } from 'react';
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
  useAnimatedReaction,
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
  const [containerSize, setContainerSize] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const [currentViewBox, setCurrentViewBox] = useState({ minX: 0, minY: 0, width: 800, height: 600 });
  const [transformState, setTransformState] = useState({ scale: 1, translateX: 0, translateY: 0 });
  const lastTransformRef = useRef({ scale: 1, translateX: 0, translateY: 0 });
  // Use ref for seats to access in worklets
  const seatsRef = useRef<Seat[]>(layoutJson.seats || []);

  // Safety check for theme
  if (!theme || !theme.colors) {
    console.warn('Theme not available in SeatLayoutViewer');
    return null;
  }

  // Sync seats with layoutJson when it changes
  React.useEffect(() => {
    const newSeats = layoutJson.seats || [];
    setSeats(newSeats);
    seatsRef.current = newSeats; // Update ref for worklet access
  }, [layoutJson.seats]);

  // Pan and zoom state
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  // Use shared values for container size (needed for worklets)
  const containerWidth = useSharedValue(SCREEN_WIDTH);
  const containerHeight = useSharedValue(SCREEN_HEIGHT);

  // Calculate viewBox dimensions with validation
  const getViewBoxDimensions = () => {
    if (!layoutJson.seats || layoutJson.seats.length === 0) {
      return { minX: 0, minY: 0, width: 800, height: 600 };
    }

    const xs = layoutJson.seats.map((s) => s.x).filter(x => typeof x === 'number' && !isNaN(x));
    const ys = layoutJson.seats.map((s) => s.y).filter(y => typeof y === 'number' && !isNaN(y));
    
    if (xs.length === 0 || ys.length === 0) {
      return { minX: 0, minY: 0, width: 800, height: 600 };
    }

    const minX = Math.min(...xs) - 100;
    const minY = Math.min(...ys) - 100;
    const maxX = Math.max(...xs) + 100;
    const maxY = Math.max(...ys) + 100;

    const width = maxX - minX;
    const height = maxY - minY;

    // Validate viewBox values
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
      console.warn('Invalid viewBox calculated, using defaults');
      return { minX: 0, minY: 0, width: 800, height: 600 };
    }

    return {
      minX,
      minY,
      width,
      height,
    };
  };

  // Memoize viewBox to prevent unnecessary re-renders
  // Use seats length and a stable reference to prevent infinite loops
  const seatsLength = layoutJson.seats?.length || 0;
  const viewBox = React.useMemo(() => getViewBoxDimensions(), [seatsLength]);

  // Remove useEffect - viewBox is already memoized and doesn't need state tracking

  // Update transform state from shared values (for minimap) - with ref check to prevent loops
  const updateTransformState = useCallback((scale: number, tx: number, ty: number) => {
    const last = lastTransformRef.current;
    // Only update if values changed significantly
    if (
      Math.abs(scale - last.scale) > 0.05 ||
      Math.abs(tx - last.translateX) > 5 ||
      Math.abs(ty - last.translateY) > 5
    ) {
      lastTransformRef.current = { scale, translateX: tx, translateY: ty };
      setTransformState({ scale, translateX: tx, translateY: ty });
    }
  }, []);

  // Update minimap state on gesture end only (prevents infinite loops)
  // Pass values as parameters to avoid accessing .value in worklet context
  const updateMinimapOnGestureEnd = useCallback((scaleVal: number, txVal: number, tyVal: number) => {
    updateTransformState(scaleVal, txVal, tyVal);
  }, [updateTransformState]);

  // Handle container layout - with ref to prevent unnecessary updates
  const lastContainerSizeRef = useRef({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const onLayout = React.useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      const last = lastContainerSizeRef.current;
      // Only update if size changed significantly (prevents loops)
      if (Math.abs(width - last.width) > 10 || Math.abs(height - last.height) > 10) {
        lastContainerSizeRef.current = { width, height };
        setContainerSize({ width, height });
        // Update shared values for worklets
        containerWidth.value = width;
        containerHeight.value = height;
      }
    }
  }, []);

  // Calculate minimap viewport rectangle (using state, not shared values)
  const getMinimapViewport = () => {
    const minimapWidth = 120;
    const minimapHeight = 80;
    const scaleX = minimapWidth / viewBox.width;
    const scaleY = minimapHeight / viewBox.height;
    const minimapScale = Math.min(scaleX, scaleY);
    
    // Use state values instead of directly accessing shared values
    const currentScale = transformState.scale;
    const currentTranslateX = transformState.translateX;
    const currentTranslateY = transformState.translateY;
    
    // Calculate viewport rectangle in minimap coordinates
    // The viewport shows what's currently visible on screen
    const viewportWidth = (containerSize.width / currentScale) * minimapScale;
    const viewportHeight = (containerSize.height / currentScale) * minimapScale;
    
    // Calculate viewport position (centered, accounting for pan)
    const centerX = (viewBox.width / 2 - viewBox.minX) * minimapScale;
    const centerY = (viewBox.height / 2 - viewBox.minY) * minimapScale;
    const viewportX = centerX - viewportWidth / 2 - (currentTranslateX * minimapScale);
    const viewportY = centerY - viewportHeight / 2 - (currentTranslateY * minimapScale);
    
    return {
      x: Math.max(0, Math.min(minimapWidth - viewportWidth, viewportX)),
      y: Math.max(0, Math.min(minimapHeight - viewportHeight, viewportY)),
      width: Math.min(viewportWidth, minimapWidth),
      height: Math.min(viewportHeight, minimapHeight),
      scale: minimapScale,
    };
  };

  // Pan gesture (for canvas panning)
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX / scale.value;
      translateY.value = savedTranslateY.value + e.translationY / scale.value;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      // Temporarily disabled minimap update to prevent crashes
      // runOnJS(updateMinimapOnGestureEnd)(scale.value, translateX.value, translateY.value);
    });

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(3, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Temporarily disabled minimap update to prevent crashes
      // runOnJS(updateMinimapOnGestureEnd)(scale.value, translateX.value, translateY.value);
    });

  // Handle seat press function - must be defined before gestures
  const handleSeatPress = useCallback((seat: Seat) => {
    setSelectedSeatInfo(seat);
    if (onSeatPress) {
      onSeatPress(seat);
    }
  }, [onSeatPress]);

  // Convert screen coordinates to SVG coordinates
  // This is called from worklet, so we need to extract viewBox values
  const viewBoxValues = React.useMemo(() => ({
    minX: viewBox.minX,
    minY: viewBox.minY,
    width: viewBox.width,
    height: viewBox.height,
  }), [viewBox.minX, viewBox.minY, viewBox.width, viewBox.height]);

  const screenToSvg = useCallback((screenX: number, screenY: number) => {
    'worklet';
    const currentScale = scale.value;
    const currentTranslateX = translateX.value;
    const currentTranslateY = translateY.value;
    const width = containerWidth.value;
    const height = containerHeight.value;
    
    // Use extracted viewBox values
    const vbWidth = viewBoxValues.width;
    const vbHeight = viewBoxValues.height;
    const vbMinX = viewBoxValues.minX;
    const vbMinY = viewBoxValues.minY;
    
    // Calculate the center offset (for iOS centering)
    const baseX = (width - vbWidth) / 2;
    const baseY = (height - vbHeight) / 2;
    
    // Reverse the transform: iosAnimatedStyle applies:
    // 1. Scale by currentScale
    // 2. Translate by (baseY + translateY)
    // 3. Translate by (baseX + translateX)
    // Transforms are applied right-to-left, so to reverse:
    // 1. Remove translateX: subtract (baseX + translateX)
    // 2. Remove translateY: subtract (baseY + translateY)
    // 3. Unscale: divide by currentScale
    
    // Step 1: Remove translateX
    let x = screenX - (baseX + currentTranslateX);
    let y = screenY - (baseY + currentTranslateY);
    
    // Step 2: Unscale
    x = x / currentScale;
    y = y / currentScale;
    
    // Step 3: Convert from SVG pixel space to SVG coordinate system
    // SVG pixel space: (0, 0) to (vbWidth, vbHeight)
    // SVG coordinate space: (vbMinX, vbMinY) to (vbMinX + vbWidth, vbMinY + vbHeight)
    // Since the SVG width/height equals vbWidth/vbHeight, mapping is 1:1 plus offset
    const svgX = x + vbMinX;
    const svgY = y + vbMinY;
    
    return { x: svgX, y: svgY };
  }, [viewBoxValues]);

  // Find nearest seat and handle press (runs on JS thread)
  const findAndHandleSeatPress = useCallback((x: number, y: number) => {
    const currentSeats = seatsRef.current;
    if (!currentSeats || currentSeats.length === 0 || !onSeatPress) return;
    
    let nearestSeat: Seat | null = null;
    let minDist = Infinity;

    currentSeats.forEach((seat) => {
      if (typeof seat.x === 'number' && typeof seat.y === 'number' && !isNaN(seat.x) && !isNaN(seat.y)) {
        const dist = Math.sqrt(
          Math.pow(seat.x - x, 2) + Math.pow(seat.y - y, 2)
        );
        if (dist < minDist && dist < 40) {
          minDist = dist;
          nearestSeat = seat;
        }
      }
    });

    if (nearestSeat) {
      handleSeatPress(nearestSeat);
    }
  }, [onSeatPress, handleSeatPress]);

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      'worklet';
      const svgCoords = screenToSvg(e.x, e.y);
      // Call JS function to find and handle seat press
      runOnJS(findAndHandleSeatPress)(svgCoords.x, svgCoords.y);
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

  // iOS-specific animated style for SVG container with proper centering
  // Use shared values and extracted viewBox values to avoid worklet issues
  const iosAnimatedStyle = useAnimatedStyle(() => {
    const currentScale = scale.value;
    // Use extracted viewBox values
    const vbWidth = viewBoxValues.width;
    const vbHeight = viewBoxValues.height;
    
    // Center the content initially, then apply pan and scale
    // Use shared values instead of state
    const baseX = (containerWidth.value - vbWidth) / 2;
    const baseY = (containerHeight.value - vbHeight) / 2;
    
    return {
      transform: [
        { translateX: baseX + translateX.value },
        { translateY: baseY + translateY.value },
        { scale: currentScale },
      ],
    };
  });

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

  // Render minimap overview
  const renderMinimap = () => {
    const minimapViewport = getMinimapViewport();
    const minimapSize = { width: 120, height: 80 };
    
    return (
      <View style={[styles.minimap, { backgroundColor: theme.colors.surface }]}>
        <Svg width={minimapSize.width} height={minimapSize.height}>
          {/* Full layout background */}
          <Rect
            x={0}
            y={0}
            width={minimapSize.width}
            height={minimapSize.height}
            fill={theme.colors.background}
            stroke={theme.colors.border}
            strokeWidth={1}
          />
          
          {/* Render seats in minimap */}
          {seats.map((seat) => {
            if (typeof seat.x !== 'number' || typeof seat.y !== 'number' || isNaN(seat.x) || isNaN(seat.y)) {
              return null;
            }
            
            const seatColor = getSeatColor(seat);
            const minimapX = ((seat.x - viewBox.minX) / viewBox.width) * minimapSize.width;
            const minimapY = ((seat.y - viewBox.minY) / viewBox.height) * minimapSize.height;
            
            return (
              <Circle
                key={seat.id}
                cx={minimapX}
                cy={minimapY}
                r={2}
                fill={seatColor}
              />
            );
          })}
          
          {/* Viewport indicator rectangle */}
          <Rect
            x={minimapViewport.x}
            y={minimapViewport.y}
            width={minimapViewport.width}
            height={minimapViewport.height}
            fill="transparent"
            stroke={theme.colors.primary}
            strokeWidth={2}
            strokeDasharray="4,2"
          />
        </Svg>
      </View>
    );
  };

  // Render SVG content (shared between platforms)
  const renderSvgContent = () => (
    <>
      {/* Render sections background */}
      {layoutJson.sections?.map((section) => (
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
          fill={shape.color || theme.colors.background}
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

        // Validate seat coordinates
        if (typeof seat.x !== 'number' || typeof seat.y !== 'number' || isNaN(seat.x) || isNaN(seat.y)) {
          return null;
        }

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
    </>
  );

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {/* Minimap Overview - Top Left */}
      {/* {renderMinimap()}\ */}

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

      {/* SVG Layout - Platform-specific rendering */}
      {Platform.OS === 'ios' ? (
        // iOS: Use GestureDetector with Animated.View wrapper
        <GestureDetector gesture={composedGesture}>
          <View style={styles.svgWrapper}>
            <Animated.View style={iosAnimatedStyle}>
              <Svg
                width={viewBox.width}
                height={viewBox.height}
                viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {renderSvgContent()}
              </Svg>
            </Animated.View>
          </View>
        </GestureDetector>
      ) : (
        // Web/Android: Keep Animated.View wrapper for pan/zoom
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.svgContainer, animatedStyle]}>
            <Svg
              width={containerSize.width}
              height={containerSize.height}
              viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {renderSvgContent()}
            </Svg>
          </Animated.View>
        </GestureDetector>
      )}

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
  minimap: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 120,
    height: 80,
    zIndex: 10,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  svgWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
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

