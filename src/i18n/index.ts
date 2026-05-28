/**
 * i18n/index.ts
 * 
 * 다국어(i18n) 설정
 * - 지원 언어: 한국어, 영어, 러시아어, 베트남어, 중국어(간체), 태국어
 * - 브라우저 언어 자동 감지
 * - react-i18next 사용
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 번역 파일 import
import ko from './locales/ko.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';
import th from './locales/th.json';

// 번역 리소스 객체
const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ru: { translation: ru },
  vi: { translation: vi },
  zh: { translation: zh },
  th: { translation: th },
};

// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ru', 'vi', 'zh', 'th'];

/**
 * 브라우저 언어 감지
 */
export const getBrowserLanguage = (): string => {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.split('-')[0];
    // 지원하는 언어인지 확인
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      return lang;
    }
  }
  return 'ko'; // 기본값
};

/**
 * i18n 초기화
 */
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBrowserLanguage(),
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false, // React는 자동으로 XSS 방지
    },
  });

export default i18n;
