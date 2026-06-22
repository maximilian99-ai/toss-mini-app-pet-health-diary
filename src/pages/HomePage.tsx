/**
 * HomePage.tsx
 * 
 * 대시보드 (홈) 페이지
 * - 반려동물 요약 카드 (가로 스크롤)
 * - 빠른 시작 버튼 (프로필, 예방접종, 병원, 체중)
 * - 다가오는 예방접종 (최대 3개)
 * - 최근 병원 기록 (최대 3개)
 * - 다국어 및 다크모드 지원
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import type { Pet, Vaccination, MedicalRecord, WeightRecord } from '../shared/types';
import { formatDate } from '../shared/utils';

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useApp();
  const [pets, setPets] = useState<Pet[]>([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<Vaccination[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);

  const loadData = () => {
    try {
      const petsData = PetHealthStorage.getPets();
      setPets(petsData);

      // 다가오는 예방접종
      const vaccinations = PetHealthStorage.getVaccinations();
      const upcoming = vaccinations
        .filter((v) => v.nextDueDate && new Date(v.nextDueDate) > new Date())
        .sort((a, b) => 
          new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime()
        )
        .slice(0, 3);
      setUpcomingVaccinations(upcoming);
      const weightData = PetHealthStorage.getWeightRecords();

      // 최근 병원 기록
      const records = PetHealthStorage.getMedicalRecords();
      const recent = records
        .sort((a, b) => 
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        )
        .slice(0, 3);
      setRecentRecords(recent);
      setWeightRecords(weightData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPetName = (petId: string): string => {
    const pet = pets.find((p) => p.id === petId);
    return pet?.name || t('common.unknown');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* 헤더 */}
      <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
          <button 
            className="p-2 text-2xl hover:scale-110 transition-transform active:scale-95"
            onClick={() => navigate('/settings')}
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
        {/* 빠른 시작 버튼 */}
        <section className="mt-4 px-4">
          <div className="grid grid-cols-4 gap-2">
            <button
              className="aspect-square rounded-2xl p-3 flex flex-col items-center justify-center bg-red-100 dark:bg-red-900/30 hover:-translate-y-0.5 transition-transform active:scale-95"
              onClick={() => navigate('/pet-profile')}
            >
              <span className="text-3xl mb-1">🐶</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white text-center">{t('home.profile')}</span>
            </button>

            <button
              className="aspect-square rounded-2xl p-3 flex flex-col items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:-translate-y-0.5 transition-transform active:scale-95"
              onClick={() => navigate('/vaccination')}
            >
              <span className="text-3xl mb-1">💉</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white text-center">{t('home.vaccination')}</span>
            </button>

            <button
              className="aspect-square rounded-2xl p-3 flex flex-col items-center justify-center bg-green-100 dark:bg-green-900/30 hover:-translate-y-0.5 transition-transform active:scale-95"
              onClick={() => navigate('/medical')}
            >
              <span className="text-3xl mb-1">🏥</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white text-center">{t('home.medical')}</span>
            </button>

            <button
              className="aspect-square rounded-2xl p-3 flex flex-col items-center justify-center bg-amber-100 dark:bg-amber-900/30 hover:-translate-y-0.5 transition-transform active:scale-95"
              onClick={() => navigate('/weight')}
            >
              <span className="text-3xl mb-1">⚖️</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white text-center">{t('home.weight')}</span>
            </button>
          </div>
        </section>

        {/* 내 반려동물 */}
        <section className="mt-4 px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('pet.list')}</h2>
            <button 
              className="text-2xl font-light text-blue-500 px-2 hover:opacity-80"
              onClick={() => navigate('/pet-profile')}
            >
              ›
            </button>
          </div>

          {pets.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm text-center">
              <span className="text-5xl block mb-3">🐾</span>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t('home.noPets')}</p>
              <button
                className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors active:scale-95"
                onClick={() => navigate('/pet-profile')}
              >
                {t('pet.add')}
              </button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  className="flex-shrink-0 w-28 bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm hover:-translate-y-0.5 transition-transform active:scale-95"
                  onClick={() => navigate(`/pet-profile/${pet.id}`)}
                >
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl">
                      {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{pet.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{pet.breed || pet.species}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 다가오는 예방접종 */}
        {upcomingVaccinations.length > 0 && (
          <section className="mt-4 px-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('home.upcomingVaccinations')}</h2>
              <button 
                className="text-2xl font-light text-blue-500 px-2 hover:opacity-80"
                onClick={() => navigate('/vaccination')}
              >
                ›
              </button>
            </div>

            <div className="space-y-2">
              {upcomingVaccinations.map((vaccination) => (
                <div key={vaccination.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      💉 {vaccination.vaccineName}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(vaccination.nextDueDate!)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getPetName(vaccination.petId)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 최근 병원 기록 */}
        {recentRecords.length > 0 && (
          <section className="mt-4 px-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('home.recentMedical')}</h2>
              <button 
                className="text-2xl font-light text-blue-500 px-2 hover:opacity-80"
                onClick={() => navigate('/medical')}
              >
                ›
              </button>
            </div>

            <div className="space-y-2">
              {recentRecords.map((record) => (
                <div key={record.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      🏥 {record.hospitalName}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(record.visitDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getPetName(record.petId)} - {record.diagnosis || record.symptoms}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 체중 기록 */}
        {weightRecords.length > 0 && (
          <section className="mt-4 px-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('home.recentWeight')}</h2>
              <button 
                className="text-2xl font-light text-blue-500 px-2 hover:opacity-80"
                onClick={() => navigate('/weight')}
              >
                ›
              </button>
            </div>

            <div className="space-y-2">
              {weightRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ⚖️ {record.weight} kg
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(record.measureDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getPetName(record.petId)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
