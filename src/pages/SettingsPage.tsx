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
import './SettingsPage.css';

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
    <div className="settings-page">
      {/* 헤더 */}
      <header className="header">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← {t('common.back')}
        </button>
        <h1 className="title">{t('settings.title')}</h1>
      </header>

      <div className="scroll-view">
        {/* 언어 설정 */}
        <section className="setting-section card">
          <h2 className="section-title">{t('settings.language')}</h2>
          <div className="setting-options">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`setting-option ${language === lang.code ? 'active' : ''}`}
                onClick={() => setLanguage(lang.code as any)}
              >
                <span className="setting-icon">{lang.flag}</span>
                <span className="setting-text">{lang.name}</span>
                {language === lang.code && <span className="check-icon">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* 테마 설정 */}
        <section className="setting-section card">
          <h2 className="section-title">{t('settings.theme')}</h2>
          <div className="setting-options">
            <button
              className={`setting-option ${themeMode === 'auto' ? 'active' : ''}`}
              onClick={() => setThemeMode('auto')}
            >
              <span className="setting-icon">🔄</span>
              <span className="setting-text">{t('settings.auto')}</span>
              {themeMode === 'auto' && <span className="check-icon">✓</span>}
            </button>

            <button
              className={`setting-option ${themeMode === 'light' ? 'active' : ''}`}
              onClick={() => setThemeMode('light')}
            >
              <span className="setting-icon">☀️</span>
              <span className="setting-text">{t('settings.light')}</span>
              {themeMode === 'light' && <span className="check-icon">✓</span>}
            </button>

            <button
              className={`setting-option ${themeMode === 'dark' ? 'active' : ''}`}
              onClick={() => setThemeMode('dark')}
            >
              <span className="setting-icon">🌙</span>
              <span className="setting-text">{t('settings.dark')}</span>
              {themeMode === 'dark' && <span className="check-icon">✓</span>}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
