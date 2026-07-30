/**
 * MedicalPage.tsx
 * 
 * 병원 기록 페이지
 * - 병원 기록 목록 표시
 * - 병원 기록 추가/수정/삭제
 * - 진료비 포맷팅
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import { generateId } from '../shared/utils';
import type { Pet, MedicalRecord } from '../shared/types';

export function MedicalPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addPoints } = useApp();
  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  
  // 폼 상태
  const [selectedPetId, setSelectedPetId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    const petsData = PetHealthStorage.getPets();
    setPets(petsData);
    
    const recordsData = PetHealthStorage.getMedicalRecords();
    const sorted = recordsData.sort((a, b) => 
      new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
    );
    setRecords(sorted);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (record?: MedicalRecord) => {
    if (record) {
      setEditingRecord(record);
      setSelectedPetId(record.petId);
      setVisitDate(record.visitDate);
      setHospitalName(record.hospitalName);
      setSymptoms(record.symptoms || '');
      setDiagnosis(record.diagnosis || '');
      setTreatment(record.treatment || '');
      setCost(record.cost?.toString() || '');
      setNotes(record.notes || '');
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setSelectedPetId(pets.length > 0 ? pets[0].id : '');
    setVisitDate('');
    setHospitalName('');
    setSymptoms('');
    setDiagnosis('');
    setTreatment('');
    setCost('');
    setNotes('');
  };

  const handleSave = () => {
    if (!selectedPetId) {
      alert(t('medical.alert.petRequired'));
      return;
    }
    if (!visitDate) {
      alert(t('medical.alert.dateRequired'));
      return;
    }
    if (!hospitalName.trim()) {
      alert(t('medical.alert.hospitalRequired'));
      return;
    }

    const isNewRecord = !editingRecord;
    const now = new Date().toISOString();
    const record: MedicalRecord = {
      id: editingRecord?.id || generateId('medical'),
      petId: selectedPetId,
      visitDate,
      hospitalName: hospitalName.trim(),
      symptoms: symptoms.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      treatment: treatment.trim() || undefined,
      cost: cost ? parseFloat(cost) : undefined,
      notes: notes.trim() || undefined,
      createdAt: editingRecord?.createdAt || now,
      updatedAt: now,
    };

    PetHealthStorage.saveMedicalRecord(record);
    loadData();
    setModalVisible(false);
    resetForm();

    // 새로운 병원 기록 추가 시 포인트 증가
    if (isNewRecord) {
      addPoints(1);
    }
  };

  const handleDelete = (record: MedicalRecord) => {
    if (window.confirm(t('medical.alert.deleteMessage'))) {
      PetHealthStorage.deleteMedicalRecord(record.id);
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

  if (pets.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <button className="text-2xl text-gray-900 dark:text-gray-100 hover:opacity-80 active:scale-95 transition-transform" onClick={() => navigate('/')}>
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('medical.title')}</h1>
            <div className="w-6"></div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <span className="text-6xl mb-4">🐾</span>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.noPetsTitle')}</p>
          <button className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl text-base font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors" onClick={() => navigate('/pet-profile')}>
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
          <button className="text-2xl text-gray-900 dark:text-gray-100 hover:opacity-80 active:scale-95 transition-transform" onClick={() => navigate('/')}>
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('medical.title')}</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        {records.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm flex flex-col items-center py-10 px-6 text-center">
            <span className="text-6xl mb-4">🏥</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.emptyTitle')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('medical.emptySubtitle')}</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-gray-600 dark:text-gray-400">{getPetName(record.petId)}</span>
                <span className="text-[13px] text-gray-600 dark:text-gray-400">{formatDate(record.visitDate)}</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">🏥 {record.hospitalName}</h3>

              <div className="flex flex-col gap-2 pt-4 pb-4 border-t border-b border-gray-200 dark:border-gray-800">
                {record.symptoms && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{t('medical.symptoms')}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">{record.symptoms}</span>
                  </div>
                )}
                
                {record.diagnosis && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{t('medical.diagnosis')}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">{record.diagnosis}</span>
                  </div>
                )}

                {record.treatment && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{t('medical.treatment')}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">{record.treatment}</span>
                  </div>
                )}

                {record.cost && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{t('medical.cost')}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">
                      {record.cost.toLocaleString()}{t('medical.won')}
                    </span>
                  </div>
                )}

                {record.notes && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{t('medical.notes')}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium text-right">{record.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-[15px] font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors" onClick={() => openModal(record)}>
                  {t('common.edit')}
                </button>
                <button className="flex-1 px-3 py-3 bg-transparent text-red-500 dark:text-red-400 border border-red-500 dark:border-red-400 rounded-xl text-[15px] font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 active:bg-red-100 dark:active:bg-red-950/30 transition-colors" onClick={() => handleDelete(record)}>
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 sm:max-w-[480px] sm:mx-auto">
        <button className="w-full px-4 py-4 bg-blue-500 text-white rounded-xl text-base font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors" onClick={() => openModal()}>
          {t('medical.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center sm:justify-center z-[1000] animate-[fadeIn_0.2s]" onClick={() => setModalVisible(false)}>
          <div className="w-full max-h-[90vh] sm:max-w-[480px] sm:max-h-[80vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col animate-[slideUp_0.3s]" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
              <button className="text-2xl text-gray-900 dark:text-gray-100 p-1" onClick={() => setModalVisible(false)}>✕</button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1 text-center">
                {editingRecord ? t('medical.edit') : t('medical.add')}
              </h2>
              <div className="w-10"></div>
            </div>

            <div className="px-5 py-5 overflow-y-auto">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('pet.name')} *</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all ${
                        selectedPetId === pet.id
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedPetId(pet.id)}
                    >
                      <span className="text-[28px]">
                        {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
                      </span>
                      <span className={`text-[13px] font-medium ${
                        selectedPetId === pet.id
                          ? 'text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>{pet.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.visitDate')} *</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 appearance-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.hospitalName')} *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder={t('medical.hospitalPlaceholder')}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.symptoms')}</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-y min-h-[80px]"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={t('medical.symptomsPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.diagnosis')}</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-y min-h-[80px]"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder={t('medical.diagnosisPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.treatment')}</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-y min-h-[80px]"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder={t('medical.treatmentPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.cost')}</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('medical.notes')}</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 resize-y min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('medical.notesPlaceholder')}
                  rows={4}
                />
              </div>

              <button className="w-full px-4 py-4 bg-blue-500 text-white rounded-xl text-base font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors" onClick={handleSave}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
