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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import type { Pet, Vaccination, MedicalRecord, WeightRecord } from '../shared/types';
import { formatDate } from '../shared/utils';
import { PROMOTION_ID, MIN_CONVERT_POINTS } from '../shared/constants';
import { grantPromotionReward } from '@apps-in-toss/web-framework';

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { points, resetPoints } = useApp();
  const [pets, setPets] = useState<Pet[]>([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<Vaccination[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

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

      // 최근 병원 기록
      const records = PetHealthStorage.getMedicalRecords();
      const recent = records
        .sort((a, b) => 
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        )
        .slice(0, 3);
      setRecentRecords(recent);

      // 최근 체중
      const recentWeight = PetHealthStorage.getWeightRecords()
        .sort((a, b) => 
          new Date(b.measureDate).getTime() - new Date(a.measureDate).getTime()
        )
        .slice(0, 3);
      setWeightRecords(recentWeight);
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

  const handleConvertPoints = () => {
    if (points === 0) {
      alert(t('points.noPoints'));
      return;
    }
    if (points < MIN_CONVERT_POINTS) {
      alert(t('points.minPoints', { min: MIN_CONVERT_POINTS }));
      return;
    }
    setShowConvertModal(true);
  };

  const handleConfirmConvert = async () => {
    setIsConverting(true);

    try {
      // 토스 프로모션 API 실제 연동
      // 참고: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/비게임/promotion.md
      console.log('[Points] 토스 프로모션 API 호출 시작');
      console.log('[Points] 전환 포인트:', points);
      console.log('[Points] Promotion ID:', PROMOTION_ID);
      
      // 비게임용 프로모션 리워드 API 호출
      const result = await grantPromotionReward({
        params: {
          promotionCode: PROMOTION_ID,
          amount: points,
        },
      });

      // 성공 처리 - "ERROR" 문자열이 아니면 성공
      if (result !== 'ERROR') {
        resetPoints();
        setShowConvertModal(false);
        alert(t('points.convertSuccess'));
        console.log('[Points] 토스 포인트 전환 성공:', result);
      } else {
        throw new Error('포인트 전환 실패');
      }
    } catch (error) {
      console.error('[Points] 토스 포인트 전환 실패:', error);
      
      // 에러 메시지 처리
      let errorMessage = t('points.convertFailed');
      
      if (error instanceof Error) {
        const message = error.message || '';
        
        if (message.includes('PROMOTION_NOT_FOUND') || message.includes('promotionCode') || message.includes('promotionId')) {
          errorMessage += '\n\n앱인토스 콘솔에서 프로모션을 먼저 생성해주세요.\n콘솔: https://console.apps-in-toss.im/';
        } else if (message.includes('NOT_SUPPORTED') || message.includes('isSupported') || message.includes('not supported')) {
          errorMessage += '\n\n브라우저가 아닌 토스 앱/샌드박스 앱에서 실행해주세요.';
        } else if (message.includes('INSUFFICIENT') || message.includes('budget')) {
          errorMessage += '\n\n프로모션 예산이 부족합니다. 콘솔에서 확인해주세요.';
        } else if (message.includes('EXPIRED')) {
          errorMessage += '\n\n프로모션 기간이 만료되었습니다.';
        } else {
          errorMessage += `\n\n상세: ${message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCancelConvert = () => {
    setShowConvertModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* 헤더 */}
      <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
          <button 
            className="p-2 text-2xl hover:scale-110 transition-transform active:scale-95"
            onClick={() => navigate('/settings')}
          >
            ⚙️
          </button>
        </div>
        <button 
          onClick={handleConvertPoints}
          className="w-full flex flex-col items-center justify-center gap-1 px-3 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 active:scale-95 transition-all"
        >
          <span className="text-xl">🪙</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {points.toLocaleString()} P
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            {t('points.tapToConvert')}
          </span>
        </button>
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

      {/* 포인트 전환 모달 */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              {t('points.modalTitle')}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {t('points.modalMessage', { points: points.toLocaleString() })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelConvert}
                disabled={isConverting}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmConvert}
                disabled={isConverting}
                className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>전환 중...</span>
                  </>
                ) : (
                  t('common.confirm')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
