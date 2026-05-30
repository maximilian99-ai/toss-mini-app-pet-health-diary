/**
 * utils.ts
 * 
 * 유틸리티 함수
 */

import i18n from '../i18n';

/** i18n 언어 코드 → Intl 로케일 코드 매핑 */
const LOCALE_MAP: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ru: 'ru-RU',
  vi: 'vi-VN',
  zh: 'zh-CN',
  th: 'th-TH',
};

/**
 * 날짜를 포맷팅
 * @param dateStr - ISO 날짜 문자열
 * @param format - 'short' | 'long'
 */
export function formatDate(dateStr: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateStr);
  const locale = LOCALE_MAP[i18n.language] ?? 'ko-KR';

  if (format === 'short') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  return date.toLocaleDateString(locale);
}

/**
 * 생년월일로부터 나이 계산
 * @param birthDate - 생년월일 (ISO string)
 * @returns 현재 언어로 포맷된 나이 문자열 (예: "2년 3개월", "2 years 3 months")
 */
export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const today = new Date();
  const ageInMonths = 
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  
  if (ageInMonths < 12) {
    return i18n.t('pet.ageMonthsOnly', { count: ageInMonths });
  } else {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return months > 0
      ? i18n.t('pet.ageYearsMonths', { years, months })
      : i18n.t('pet.ageYearsOnly', { count: years });
  }
}

/**
 * 날짜가 다가오는지 확인
 * @param dateStr - 확인할 날짜
 * @param daysThreshold - 며칠 이내인지 (기본 7일)
 */
export function isUpcoming(dateStr: string, daysThreshold: number = 7): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= daysThreshold;
}

/**
 * ID 생성
 * @param prefix - ID 접두사
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 배열을 날짜 기준으로 정렬
 * @param items - 정렬할 배열
 * @param dateField - 날짜 필드명
 * @param order - 'asc' | 'desc'
 */
export function sortByDate<T>(
  items: T[],
  dateField: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField] as string).getTime();
    const dateB = new Date(b[dateField] as string).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
