/**
 * storage.ts
 * 
 * localStorage 기반 로컬 데이터 관리
 * - 모든 앱 데이터를 하나의 키에 JSON으로 저장
 * - CRUD 작업: 반려동물 프로필, 예방접종, 병원기록, 체중기록, 일상메모
 * - 데이터 무결성 검증
 */

import { STORAGE_KEY } from '../shared/constants';
import type { Pet, Vaccination, MedicalRecord, WeightRecord, DailyNote, AppData } from '../shared/types';

// 기본 데이터 구조
const DEFAULT_APP_DATA: AppData = {
  pets: [],
  vaccinations: [],
  medicalRecords: [],
  weightRecords: [],
  dailyNotes: [],
};

export const PetHealthStorage = {
  /**
   * 전체 데이터 가져오기
   */
  getAllData(): AppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      
      if (data) {
        const parsed = JSON.parse(data);
        console.log('[Storage] Loaded data:', {
          pets: parsed.pets?.length || 0,
          vaccinations: parsed.vaccinations?.length || 0,
          medicalRecords: parsed.medicalRecords?.length || 0,
          weightRecords: parsed.weightRecords?.length || 0,
          dailyNotes: parsed.dailyNotes?.length || 0,
        });
        return parsed;
      }
      
      console.log('[Storage] No data found, returning default');
      return DEFAULT_APP_DATA;
    } catch (error) {
      console.error('[Storage] Error getting all data:', error);
      return DEFAULT_APP_DATA;
    }
  },

  /**
   * 전체 데이터 저장하기
   */
  saveAllData(data: AppData): void {
    try {
      console.log('[Storage] Saving data:', {
        pets: data.pets.length,
        vaccinations: data.vaccinations.length,
        medicalRecords: data.medicalRecords.length,
        weightRecords: data.weightRecords.length,
        dailyNotes: data.dailyNotes.length,
      });
      
      const jsonData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, jsonData);
      
      console.log('[Storage] ✅ Data saved successfully');
    } catch (error) {
      console.error('[Storage] ❌ Error saving data:', error);
      throw error;
    }
  },

  /**
   * 반려동물 목록 가져오기
   */
  getPets(): Pet[] {
    const data = this.getAllData();
    return data.pets;
  },

  /**
   * 반려동물 저장/수정
   */
  savePet(pet: Pet): void {
    const data = this.getAllData();
    const existingIndex = data.pets.findIndex((p) => p.id === pet.id);
    
    if (existingIndex >= 0) {
      data.pets[existingIndex] = pet;
    } else {
      data.pets.push(pet);
    }
    
    this.saveAllData(data);
  },

  /**
   * 반려동물 삭제 (cascade delete)
   */
  deletePet(petId: string): void {
    const data = this.getAllData();
    data.pets = data.pets.filter((p) => p.id !== petId);
    // 해당 반려동물의 모든 기록도 삭제
    data.vaccinations = data.vaccinations.filter((v) => v.petId !== petId);
    data.medicalRecords = data.medicalRecords.filter((m) => m.petId !== petId);
    data.weightRecords = data.weightRecords.filter((w) => w.petId !== petId);
    data.dailyNotes = data.dailyNotes.filter((n) => n.petId !== petId);
    
    this.saveAllData(data);
  },

  /**
   * 예방접종 기록 가져오기
   */
  getVaccinations(petId?: string): Vaccination[] {
    const data = this.getAllData();
    return petId
      ? data.vaccinations.filter((v) => v.petId === petId)
      : data.vaccinations;
  },

  /**
   * 예방접종 저장/수정
   */
  saveVaccination(vaccination: Vaccination): void {
    const data = this.getAllData();
    const existingIndex = data.vaccinations.findIndex((v) => v.id === vaccination.id);
    
    if (existingIndex >= 0) {
      data.vaccinations[existingIndex] = vaccination;
    } else {
      data.vaccinations.push(vaccination);
    }
    
    this.saveAllData(data);
  },

  /**
   * 예방접종 삭제
   */
  deleteVaccination(vaccinationId: string): void {
    const data = this.getAllData();
    data.vaccinations = data.vaccinations.filter((v) => v.id !== vaccinationId);
    this.saveAllData(data);
  },

  /**
   * 병원 기록 가져오기
   */
  getMedicalRecords(petId?: string): MedicalRecord[] {
    const data = this.getAllData();
    return petId
      ? data.medicalRecords.filter((m) => m.petId === petId)
      : data.medicalRecords;
  },

  /**
   * 병원 기록 저장/수정
   */
  saveMedicalRecord(record: MedicalRecord): void {
    const data = this.getAllData();
    const existingIndex = data.medicalRecords.findIndex((m) => m.id === record.id);
    
    if (existingIndex >= 0) {
      data.medicalRecords[existingIndex] = record;
    } else {
      data.medicalRecords.push(record);
    }
    
    this.saveAllData(data);
  },

  /**
   * 병원 기록 삭제
   */
  deleteMedicalRecord(recordId: string): void {
    const data = this.getAllData();
    data.medicalRecords = data.medicalRecords.filter((m) => m.id !== recordId);
    this.saveAllData(data);
  },

  /**
   * 체중 기록 가져오기
   */
  getWeightRecords(petId?: string): WeightRecord[] {
    const data = this.getAllData();
    return petId
      ? data.weightRecords.filter((w) => w.petId === petId)
      : data.weightRecords;
  },

  /**
   * 체중 기록 저장
   */
  saveWeightRecord(record: WeightRecord): void {
    const data = this.getAllData();
    const existingIndex = data.weightRecords.findIndex((w) => w.id === record.id);
    
    if (existingIndex >= 0) {
      data.weightRecords[existingIndex] = record;
    } else {
      data.weightRecords.push(record);
    }
    
    this.saveAllData(data);
  },

  /**
   * 체중 기록 삭제
   */
  deleteWeightRecord(recordId: string): void {
    const data = this.getAllData();
    data.weightRecords = data.weightRecords.filter((w) => w.id !== recordId);
    this.saveAllData(data);
  },

  /**
   * 일상 메모 가져오기
   */
  getDailyNotes(petId?: string): DailyNote[] {
    const data = this.getAllData();
    return petId
      ? data.dailyNotes.filter((n) => n.petId === petId)
      : data.dailyNotes;
  },

  /**
   * 일상 메모 저장/수정
   */
  saveDailyNote(note: DailyNote): void {
    const data = this.getAllData();
    const existingIndex = data.dailyNotes.findIndex((n) => n.id === note.id);
    
    if (existingIndex >= 0) {
      data.dailyNotes[existingIndex] = note;
    } else {
      data.dailyNotes.push(note);
    }
    
    this.saveAllData(data);
  },

  /**
   * 일상 메모 삭제
   */
  deleteDailyNote(noteId: string): void {
    const data = this.getAllData();
    data.dailyNotes = data.dailyNotes.filter((n) => n.id !== noteId);
    this.saveAllData(data);
  },

  /**
   * 전체 데이터 삭제 (앱 초기화)
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[Storage] All data cleared');
    } catch (error) {
      console.error('[Storage] Error clearing data:', error);
    }
  },

  /**
   * 디버깅: 전체 데이터 출력
   */
  debugStorage(): void {
    const data = this.getAllData();
    console.log('[Storage Debug] Full data:', data);
  },
};
