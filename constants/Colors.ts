export const LightColors = {
  primary: '#007AFF', // iOS blue
  secondary: '#10B981',
  accent: '#F59E0B',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  cardBackground: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  // Additional colors from reference
  lightGray: '#F2F2F7',
  mediumGray: '#C7C7CC',
  darkGray: '#48484A',
  // Card colors
  cardTeal: '#5AC8FA',
  cardBlue: '#007AFF',
  cardOrange: '#FF9500',
  cardGreen: '#34C759',
  cardYellow: '#FFCC00',
  cardPurple: '#AF52DE',
  cardRed: '#FF3B30',
  cardPink: '#FF2D55',
};

export const DarkColors = {
  primary: '#3B82F6',
  secondary: '#34D399',
  accent: '#FBBF24',
  background: '#111827',
  surface: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#3B82F6',
};

export type ColorScheme = 'light' | 'dark';

export const getColors = (scheme: ColorScheme) => {
  return scheme === 'light' ? LightColors : DarkColors;
};

