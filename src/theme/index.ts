// src/theme/index.ts
export const theme = {
  colors: {
    primary: '#6C63FF',        // Royal Purple
    secondary: '#FF4F81',      // Hot Pink
    accent: '#FFC736',         // Gold Yellow
    background: '#F8FAFC',     // Soft White
    backgroundDark: '#0F172A', // Deep Navy
    text: '#0F172A',
    textLight: '#F8FAFC',
    gray: '#64748B',
    success: '#22C55E',        // Neon Green
    danger: '#EF4444',         // Red
    warning: '#FFC736',
    white: '#FFFFFF',
    black: '#000000',
  },
  // Mode-specific colors
  modes: {
    child: {
      primary: '#FF6B9D',      // Bright Pink
      secondary: '#FFD93D',    // Bright Yellow
      accent: '#6BCF7F',       // Bright Green
      background: '#FFF5F7',
    },
    teen: {
      primary: '#FF4F81',      // Hot Pink
      secondary: '#6C63FF',    // Royal Purple
      accent: '#00F5FF',       // Neon Cyan
      background: '#1A1A2E',
    },
    adult: {
      primary: '#6C63FF',      // Royal Purple
      secondary: '#FF4F81',    // Hot Pink
      accent: '#FFC736',       // Gold Yellow
      background: '#0F172A',   // Deep Navy
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  text: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
  },
} as const;

// Export theme type for TypeScript
export type AppTheme = typeof theme;