/**
 * constants.ts
 * 
 * 앱 전역 상수
 */

// 로컬스토리지 키
export const STORAGE_KEY = '@pet_health_diary';
export const THEME_MODE_KEY = '@pet_health_theme_mode';
export const LANGUAGE_KEY = '@pet_health_language';
export const POINTS_KEY = '@pet_health_points';

// 토스 프로모션 설정
// 앱인토스 콘솔(https://console.apps-in-toss.im/)에서 프로모션 생성 후
// 발급받은 프로모션 코드로 교체하세요
// 예: export const PROMOTION_ID = 'promo_abc123xyz456';
export const PROMOTION_ID = 'YOUR_PROMOTION_ID';
export const MIN_CONVERT_POINTS = 1; // 최소 전환 포인트

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
