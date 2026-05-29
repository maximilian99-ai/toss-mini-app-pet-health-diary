/**
 * SettingsPage.tsx
 * 
 * 설정 페이지
 * - 언어 선택
 * - 테마 선택
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { SUPPORTED_LANGUAGES } from '../shared/constants';

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { themeMode, language, setThemeMode, setLanguage } = useApp();

  const selectedLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === language);

  const getThemeLabel = () => {
    if (themeMode === 'auto') return t('settings.auto');
    if (themeMode === 'dark') return t('settings.dark');
    return t('settings.light');
  };

  const getThemeIcon = () => {
    if (themeMode === 'auto') return '🔄';
    if (themeMode === 'dark') return '🌙';
    return '☀️';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* 헤더 */}
      <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <button className="text-2xl text-gray-900 dark:text-gray-100 hover:opacity-80 active:scale-95 transition-transform" onClick={() => navigate('/')}>
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('settings.title')}</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* 언어 설정 */}
        <section className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('settings.language')}</h2>
          <div className="space-y-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  language === lang.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setLanguage(lang.code as any)}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">{lang.name}</span>
                {language === lang.code && <span className="text-blue-500 text-xl font-bold">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* 테마 설정 */}
        <section className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('settings.theme')}</h2>
          <div className="space-y-2">
            <button
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                themeMode === 'auto'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setThemeMode('auto')}
            >
              <span className="text-2xl">🔄</span>
              <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">{t('settings.auto')}</span>
              {themeMode === 'auto' && <span className="text-blue-500 text-xl font-bold">✓</span>}
            </button>

            <button
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                themeMode === 'light'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setThemeMode('light')}
            >
              <span className="text-2xl">☀️</span>
              <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">{t('settings.light')}</span>
              {themeMode === 'light' && <span className="text-blue-500 text-xl font-bold">✓</span>}
            </button>

            <button
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                themeMode === 'dark'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setThemeMode('dark')}
            >
              <span className="text-2xl">🌙</span>
              <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">{t('settings.dark')}</span>
              {themeMode === 'dark' && <span className="text-blue-500 text-xl font-bold">✓</span>}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
