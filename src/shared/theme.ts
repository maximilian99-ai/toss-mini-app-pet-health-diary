/**
 * theme.ts
 * 
 * 테마 시스템
 * - 라이트/다크 테마 색상 정의
 * - TDS colors 기반
 * - CSS 변수 기반 동적 테마 적용
 */

import { colors } from '@toss/tds-colors';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  background: string;
  backgroundSecondary: string;
  surface: string;
  
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  border: string;
  borderLight: string;
  
  error: string;
  success: string;
  warning: string;
}

export const lightColors: ThemeColors = {
  primary: colors.blue600,
  primaryLight: colors.blue100,
  primaryDark: colors.blue800,
  
  background: colors.grey50,
  backgroundSecondary: colors.grey100,
  surface: colors.white,
  
  text: colors.grey900,
  textSecondary: colors.grey600,
  textTertiary: colors.grey500,
  
  border: colors.grey200,
  borderLight: colors.grey100,
  
  error: colors.red600,
  success: colors.green600,
  warning: colors.orange600,
};

export const darkColors: ThemeColors = {
  primary: colors.blue500,
  primaryLight: colors.blue900,
  primaryDark: colors.blue400,
  
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#2C2C2C',
  
  text: colors.grey100,
  textSecondary: colors.grey400,
  textTertiary: colors.grey500,
  
  border: colors.grey700,
  borderLight: colors.grey800,
  
  error: colors.red400,
  success: colors.green400,
  warning: colors.orange400,
};

/**
 * 테마 객체 생성
 */
export const getTheme = (mode: 'light' | 'dark') => ({
  colors: mode === 'light' ? lightColors : darkColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
});

/**
 * CSS 변수로 테마 적용
 */
export function applyTheme(mode: 'light' | 'dark') {
  const theme = mode === 'light' ? lightColors : darkColors;
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${camelToKebab(key)}`, value);
  });
}

/**
 * camelCase를 kebab-case로 변환
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 현재 시스템 테마 감지
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}
