/**
 * VaccinationPage.tsx
 * 
 * 예방접종 기록 페이지
 * - 예방접종 목록 표시
 * - 예방접종 추가/수정/삭제
 * - 다가오는 접종 배지
 * - 기한 지난 접종 표시
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import { generateId } from '../shared/utils';
import type { Pet, Vaccination } from '../shared/types';

export function VaccinationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addPoints } = useApp();
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  
  // 폼 상태
  const [selectedPetId, setSelectedPetId] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    const petsData = PetHealthStorage.getPets();
    setPets(petsData);
    
    const vaccinationsData = PetHealthStorage.getVaccinations();
    const sorted = vaccinationsData.sort((a, b) => 
      new Date(b.vaccinationDate).getTime() - new Date(a.vaccinationDate).getTime()
    );
    setVaccinations(sorted);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (vaccination?: Vaccination) => {
    if (vaccination) {
      setEditingVaccination(vaccination);
      setSelectedPetId(vaccination.petId);
      setVaccineName(vaccination.vaccineName);
      setVaccinationDate(vaccination.vaccinationDate);
      setNextDueDate(vaccination.nextDueDate || '');
      setHospitalName(vaccination.hospitalName || '');
      setNotes(vaccination.notes || '');
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingVaccination(null);
    setSelectedPetId(pets.length > 0 ? pets[0].id : '');
    setVaccineName('');
    setVaccinationDate('');
    setNextDueDate('');
    setHospitalName('');
    setNotes('');
  };

  const handleSave = () => {
    if (!selectedPetId) {
      alert(t('vaccination.alert.petRequired'));
      return;
    }
    if (!vaccineName.trim()) {
      alert(t('vaccination.alert.nameRequired'));
      return;
    }
    if (!vaccinationDate) {
      alert(t('vaccination.alert.dateRequired'));
      return;
    }

    const isNewVaccination = !editingVaccination;
    const now = new Date().toISOString();
    const vaccination: Vaccination = {
      id: editingVaccination?.id || generateId('vaccination'),
      petId: selectedPetId,
      vaccineName: vaccineName.trim(),
      vaccinationDate,
      nextDueDate: nextDueDate || undefined,
      hospitalName: hospitalName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingVaccination?.createdAt || now,
      updatedAt: now,
    };

    PetHealthStorage.saveVaccination(vaccination);
    loadData();
    setModalVisible(false);
    resetForm();

    // 새로운 예방접종 추가 시 포인트 증가
    if (isNewVaccination) {
      addPoints(1);
    }
  };

  const handleDelete = (vaccination: Vaccination) => {
    if (window.confirm(t('vaccination.alert.deleteMessage'))) {
      PetHealthStorage.deleteVaccination(vaccination.id);
      loadData();
    }
  };

  const getPetName = (petId: string): string => {
    const pet = pets.find((p) => p.id === petId);
    return pet?.name || t('common.unknown');
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR');
  };

  const getDaysUntil = (dateStr: string): number => {
    const today = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (pets.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('vaccination.title')}</h1>
            <div className="w-6"></div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <span className="text-6xl mb-4">🐾</span>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('vaccination.noPetsTitle')}
          </p>
          <button 
            className="mt-4 w-full max-w-xs px-4 py-4 bg-blue-600 text-white rounded-xl text-base font-semibold active:bg-blue-700"
            onClick={() => navigate('/pet-profile')}
          >
            {t('pet.register')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('vaccination.title')}</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {vaccinations.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-10 shadow-sm flex flex-col items-center text-center">
            <span className="text-6xl mb-4">💉</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('vaccination.emptyTitle')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('vaccination.emptySubtitle')}
            </p>
          </div>
        ) : (
          vaccinations.map((vaccination) => {
            const daysUntil = vaccination.nextDueDate 
              ? getDaysUntil(vaccination.nextDueDate) 
              : null;
            const isUpcoming = daysUntil !== null && daysUntil > 0 && daysUntil <= 30;
            const isOverdue = daysUntil !== null && daysUntil < 0;

            return (
              <div 
                key={vaccination.id} 
                className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getPetName(vaccination.petId)}
                  </span>
                  {(isUpcoming || isOverdue) && (
                    <span 
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                        isOverdue 
                          ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400' 
                          : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {isOverdue 
                        ? t('vaccination.overdue') 
                        : t('vaccination.daysLeft', { days: daysUntil })}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  💉 {vaccination.vaccineName}
                </h3>

                <div className="flex flex-col gap-2 py-4 border-t border-b border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                      {t('vaccination.vaccinationDate')}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">
                      {formatDate(vaccination.vaccinationDate)}
                    </span>
                  </div>
                  
                  {vaccination.nextDueDate && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {t('vaccination.nextDue')}
                      </span>
                      <span className={`text-sm font-medium text-right ${
                        isOverdue 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {formatDate(vaccination.nextDueDate)}
                      </span>
                    </div>
                  )}

                  {vaccination.hospitalName && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {t('vaccination.hospital')}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">
                        {vaccination.hospitalName}
                      </span>
                    </div>
                  )}

                  {vaccination.notes && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {t('vaccination.notes')}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">
                        {vaccination.notes}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 px-3 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm font-semibold active:bg-gray-200 dark:active:bg-gray-700"
                    onClick={() => openModal(vaccination)}
                  >
                    {t('common.edit')}
                  </button>
                  <button 
                    className="flex-1 px-3 py-3 bg-transparent text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-xl text-sm font-semibold active:bg-red-50 dark:active:bg-red-950"
                    onClick={() => handleDelete(vaccination)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 fixed bottom-0 left-0 right-0 md:max-w-[480px] md:mx-auto">
        <button 
          className="w-full px-4 py-4 bg-blue-600 text-white rounded-xl text-base font-semibold active:bg-blue-700"
          onClick={() => openModal()}
        >
          {t('vaccination.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-end md:items-center md:justify-center z-[1000] animate-fadeIn"
          onClick={() => setModalVisible(false)}
        >
          <div 
            className="w-full max-h-[90vh] md:max-w-[480px] md:max-h-[80vh] bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl flex flex-col animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <button 
                className="text-2xl text-gray-900 dark:text-gray-100 p-1 -ml-1" 
                onClick={() => setModalVisible(false)}
              >
                ✕
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1 text-center">
                {editingVaccination ? t('vaccination.edit') : t('vaccination.add')}
              </h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('pet.name')} *
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                        selectedPetId === pet.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                      onClick={() => setSelectedPetId(pet.id)}
                    >
                      <span className="text-3xl">
                        {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
                      </span>
                      <span className={`text-sm font-medium ${
                        selectedPetId === pet.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {pet.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('vaccination.vaccineName')} *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder={t('vaccination.vaccineNamePlaceholder')}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('vaccination.vaccinationDate')} *
                </label>
                <input
                  type="date"
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 appearance-none focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  value={vaccinationDate}
                  onChange={(e) => setVaccinationDate(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('vaccination.nextDue')}
                </label>
                <input
                  type="date"
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 appearance-none focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('vaccination.hospital')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder={t('vaccination.hospitalPlaceholder')}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('vaccination.notes')}
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 resize-vertical min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('vaccination.notesPlaceholder')}
                  rows={4}
                />
              </div>

              <button 
                className="w-full px-4 py-4 bg-blue-600 text-white rounded-xl text-base font-semibold active:bg-blue-700"
                onClick={handleSave}
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
