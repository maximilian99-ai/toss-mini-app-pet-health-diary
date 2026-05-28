/**
 * types.ts
 * 
 * TypeScript 타입 정의
 * - 반려동물 건강 다이어리 관련 타입
 * - 앱 상태 타입
 */

/**
 * 반려동물 정보
 * - 기본 프로필 정보 (이름, 종, 품종, 생년월일 등)
 */
export interface Pet {
  id: string;
  name: string;
  species: string; // '강아지', '고양이', '기타'
  breed?: string; // 품종
  birthDate?: string; // 생년월일
  gender?: 'male' | 'female' | 'unknown';
  weight?: number; // 현재 체중 (kg)
  photo?: string; // base64 또는 로컬 경로
  adoptionDate?: string; // 입양일
  notes?: string; // 특이사항
  createdAt: string;
  updatedAt: string;
}

/**
 * 예방접종 기록
 * - 백신 접종 정보 및 다음 접종 예정일
 */
export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string; // 백신명 (광견병, 종합백신 등)
  vaccinationDate: string; // 접종일
  nextDueDate?: string; // 다음 접종 예정일
  hospitalName?: string; // 병원명
  notes?: string; // 메모
  createdAt: string;
  updatedAt: string;
}

/**
 * 병원 방문 기록
 * - 진료 정보 (증상, 진단, 치료, 비용 등)
 */
export interface MedicalRecord {
  id: string;
  petId: string;
  visitDate: string; // 방문일
  hospitalName: string; // 병원명
  symptoms?: string; // 증상
  diagnosis?: string; // 진단명
  treatment?: string; // 치료 내용
  cost?: number; // 진료비
  nextVisitDate?: string; // 다음 방문 예정일
  notes?: string; // 메모
  createdAt: string;
  updatedAt: string;
}

/**
 * 체중 기록
 * - 체중 측정 데이터
 */
export interface WeightRecord {
  id: string;
  petId: string;
  weight: number; // 체중 (kg)
  measureDate: string; // 측정일
  notes?: string; // 메모
  createdAt: string;
}

/**
 * 일상 메모/일지
 * - 반려동물 일상 기록
 */
export interface DailyNote {
  id: string;
  petId: string;
  date: string; // 날짜
  title?: string; // 제목
  content: string; // 내용
  mood?: 'happy' | 'normal' | 'sad' | 'sick'; // 컨디션
  photos?: string[]; // 사진들 (base64 또는 로컬 경로)
  createdAt: string;
  updatedAt: string;
}

/**
 * 앱 전체 데이터 구조
 * - localStorage에 저장되는 모든 데이터
 */
export interface AppData {
  pets: Pet[];
  vaccinations: Vaccination[];
  medicalRecords: MedicalRecord[];
  weightRecords: WeightRecord[];
  dailyNotes: DailyNote[];
}

/**
 * 테마 모드 타입
 */
export type ThemeMode = 'auto' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

/**
 * 지원 언어 타입
 */
export type Language = 'ko' | 'en' | 'ru' | 'vi' | 'zh' | 'th';
