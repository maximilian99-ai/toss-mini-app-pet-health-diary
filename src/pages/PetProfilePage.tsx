/**
 * PetProfilePage.tsx
 * 
 * 반려동물 프로필 관리 페이지
 * - 반려동물 목록 표시 (카드 형식)
 * - 반려동물 추가/수정/삭제
 * - 모달로 폼 입력
 * - 나이 자동 계산
 * - 삭제 시 cascade delete
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import { calculateAge, generateId } from '../shared/utils';
import type { Pet } from '../shared/types';

export function PetProfilePage() {
  const { t } = useTranslation();
  const { addPoints } = useApp();
  const [pets, setPets] = useState<Pet[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  
  // 폼 상태
  const [name, setName] = useState('');
  const [species, setSpecies] = useState(t('pet.dog'));
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const loadPets = () => {
    const data = PetHealthStorage.getPets();
    setPets(data);
  };

  useEffect(() => {
    loadPets();
  }, []);

  const openModal = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setName(pet.name);
      setSpecies(pet.species);
      setBreed(pet.breed || '');
      setBirthDate(pet.birthDate || '');
      setGender(pet.gender || 'unknown');
      setWeight(pet.weight?.toString() || '');
      setNotes(pet.notes || '');
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingPet(null);
    setName('');
    setSpecies(t('pet.dog'));
    setBreed('');
    setBirthDate('');
    setGender('unknown');
    setWeight('');
    setNotes('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert(t('pet.alert.nameRequired'));
      return;
    }

    const isNewPet = !editingPet;
    const now = new Date().toISOString();
    const pet: Pet = {
      id: editingPet?.id || generateId('pet'),
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      birthDate: birthDate || undefined,
      gender,
      weight: weight ? parseFloat(weight) : undefined,
      notes: notes.trim() || undefined,
      createdAt: editingPet?.createdAt || now,
      updatedAt: now,
    };

    PetHealthStorage.savePet(pet);
    loadPets();
    setModalVisible(false);
    resetForm();

    // 새로운 프로필 추가 시 포인트 증가
    if (isNewPet) {
      addPoints(1);
    }
  };

  const handleDelete = (pet: Pet) => {
    if (window.confirm(t('pet.alert.deleteMessage', { name: pet.name }))) {
      PetHealthStorage.deletePet(pet.id);
      loadPets();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* 헤더 */}
      <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('pet.title')}</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
        {pets.length === 0 ? (
          <div className="m-4 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm text-center">
            <span className="text-5xl block mb-3">🐾</span>
            <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">{t('pet.emptyTitle')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('pet.emptySubtitle')}</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">
                      {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{pet.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pet.breed || pet.species}
                      {pet.birthDate && ` · ${calculateAge(pet.birthDate)}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {pet.gender && pet.gender !== 'unknown' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('pet.gender')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pet.gender === 'male' ? t('pet.male') : t('pet.female')}
                      </span>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('pet.weight')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{pet.weight}{t('pet.kg')}</span>
                    </div>
                  )}
                  {pet.birthDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('pet.birthDate')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(pet.birthDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  )}
                  {pet.notes && (
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">{t('pet.notes')}</span>
                      <span className="text-gray-900 dark:text-white">{pet.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors active:scale-95"
                    onClick={() => openModal(pet)}
                  >
                    {t('common.edit')}
                  </button>
                  <button 
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors active:scale-95"
                    onClick={() => handleDelete(pet)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추가 버튼 */}
      <footer className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <button 
          className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors active:scale-95"
          onClick={() => openModal()}
        >
          {t('pet.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setModalVisible(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
              <button className="text-xl text-gray-900 dark:text-gray-100 w-8 h-8 hover:opacity-80" onClick={() => setModalVisible(false)}>
                ✕
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingPet ? t('pet.edit') : t('pet.add')}
              </h2>
              <div className="w-8"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pet.name')} *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('pet.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pet.species')}
                </label>
                <div className="flex gap-2">
                  {[
                    { value: t('pet.dog'), label: t('pet.dog') },
                    { value: t('pet.cat'), label: t('pet.cat') },
                    { value: t('pet.other'), label: t('pet.other') },
                  ].map((s) => (
                    <button
                      key={s.value}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors ${
                        species === s.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSpecies(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pet.breed')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder={t('pet.breedPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pet.gender')}
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'male', label: t('pet.male') },
                    { value: 'female', label: t('pet.female') },
                    { value: 'unknown', label: t('pet.unknown') },
                  ].map((g) => (
                    <button
                      key={g.value}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors ${
                        gender === g.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setGender(g.value as any)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pet.birthDate')}
                </label>
                <input
                  type="date"
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pet.weight')} ({t('pet.kg')})
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={t('weight.weightPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pet.notes')}
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('pet.notesPlaceholder')}
                  rows={4}
                />
              </div>

              <button 
                className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors active:scale-95" 
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
