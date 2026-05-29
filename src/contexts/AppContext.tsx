/**
 * AppContext.tsx
 * 
 * 앱 전역 상태 관리 (Context API)
 * - 테마 관리: Auto / Light / Dark 모드
 * - 언어 관리: 6개 언어 지원 (ko, en, ru, vi, zh, th)
 * - localStorage에 설정 저장 및 복원
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { applyTheme, getSystemTheme } from '../shared/theme';
import { THEME_MODE_KEY, LANGUAGE_KEY } from '../shared/constants';
import type { ThemeMode, Theme, Language } from '../shared/types';

interface AppContextType {
  theme: Theme;
  themeMode: ThemeMode;
  language: Language;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider 컴포넌트
 * - 전역 상태 제공
 * - localStorage에서 설정 불러오기/저장
 * - 시스템 테마에 따른 자동 전환
 */
export function AppProvider({ children }: AppProviderProps) {
  const { i18n } = useTranslation();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [language, setLanguageState] = useState<Language>('ko');
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme());

  // 실제 적용되는 테마 계산
  const theme: Theme = themeMode === 'auto' ? systemTheme : themeMode;

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 테마 적용
  useEffect(() => {
    applyTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // TailwindCSS 다크모드를 위한 클래스 추가/제거
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 앱 시작 시 저장된 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * localStorage에서 저장된 설정 불러오기
   * - localStorage에 저장된 값이 없으면 디바이스 설정을 따름
   */
  const loadSettings = async () => {
    try {
      const savedThemeMode = localStorage.getItem(THEME_MODE_KEY);
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY);

      // 테마: localStorage에 저장된 값이 있으면 사용, 없으면 'auto' (디바이스 설정 따름)
      if (savedThemeMode) {
        setThemeModeState(savedThemeMode as ThemeMode);
      }
      // 'auto'가 기본값이므로 localStorage에 값이 없으면 디바이스 설정을 따름

      // 언어: localStorage에 저장된 값이 있으면 사용, 없으면 i18n이 감지한 브라우저 언어 사용
      if (savedLanguage) {
        setLanguageState(savedLanguage as Language);
        i18n.changeLanguage(savedLanguage);
      } else {
        // i18n이 이미 브라우저 언어를 감지해서 초기화했으므로 그 값을 사용
        const browserLang = i18n.language as Language;
        setLanguageState(browserLang);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  /**
   * 테마 모드 변경
   */
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  /**
   * 언어 변경
   */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <AppContext.Provider value={{ theme, themeMode, language, setThemeMode, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useApp 훅
 * - AppContext 사용을 위한 편의 훅
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
