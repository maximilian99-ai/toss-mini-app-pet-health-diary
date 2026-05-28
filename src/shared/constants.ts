/**
 * constants.ts
 * 
 * 앱 전역 상수
 */

// 로컬스토리지 키
export const STORAGE_KEY = '@pet_health_diary';
export const THEME_MODE_KEY = '@pet_health_theme_mode';
export const LANGUAGE_KEY = '@pet_health_language';

// 지원 언어 목록
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
] as const;

// 반려동물 종류
export const PET_SPECIES = {
  DOG: 'dog',
  CAT: 'cat',
  OTHER: 'other',
} as const;

// 성별
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown',
} as const;
