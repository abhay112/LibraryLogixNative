import { ColorScheme } from './Colors';
import { getColors } from './Colors';
import { Typography } from './Typography';
import { Spacing } from './Spacing';

export interface Theme {
  colors: ReturnType<typeof getColors>;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export const createTheme = (colorScheme: ColorScheme): Theme => {
  const colors = getColors(colorScheme);
  const isDark = colorScheme === 'dark';

  return {
    colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
    },
    shadows: {
      sm: {
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
    },
  };
};

