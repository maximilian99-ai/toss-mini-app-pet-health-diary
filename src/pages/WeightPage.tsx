/**
 * WeightPage.tsx
 * 
 * 체중 관리 페이지
 * - 체중 기록 목록 표시
 * - 체중 기록 추가/수정/삭제
 * - 체중 추이 차트 시각화
 * - 증감량 자동 계산
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import { generateId } from '../shared/utils';
import type { Pet, WeightRecord } from '../shared/types';

export function WeightPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useApp();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WeightRecord | null>(null);
  
  // 폼 상태
  const [weight, setWeight] = useState('');
  const [measureDate, setMeasureDate] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    const petsData = PetHealthStorage.getPets();
    setPets(petsData);
    
    if (petsData.length > 0 && !selectedPet) {
      setSelectedPet(petsData[0]);
    }
  };

  const loadRecords = (petId: string) => {
    const recordsData = PetHealthStorage.getWeightRecords(petId);
    const sorted = recordsData.sort((a, b) => 
      new Date(b.measureDate).getTime() - new Date(a.measureDate).getTime()
    );
    setRecords(sorted);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadRecords(selectedPet.id);
    }
  }, [selectedPet]);

  const openModal = (record?: WeightRecord) => {
    if (record) {
      setEditingRecord(record);
      setWeight(record.weight.toString());
      setMeasureDate(record.measureDate);
      setNotes(record.notes || '');
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setWeight('');
    setMeasureDate('');
    setNotes('');
  };

  const handleSave = () => {
    if (!selectedPet) {
      alert(t('weight.alert.petRequired'));
      return;
    }
    if (!weight.trim() || isNaN(parseFloat(weight))) {
      alert(t('weight.alert.weightRequired'));
      return;
    }
    if (!measureDate) {
      alert(t('weight.alert.dateRequired'));
      return;
    }

    const now = new Date().toISOString();
    const record: WeightRecord = {
      id: editingRecord?.id || generateId('weight'),
      petId: selectedPet.id,
      weight: parseFloat(weight),
      measureDate,
      notes: notes.trim() || undefined,
      createdAt: editingRecord?.createdAt || now,
    };

    PetHealthStorage.saveWeightRecord(record);
    loadRecords(selectedPet.id);
    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (record: WeightRecord) => {
    if (window.confirm(t('weight.alert.deleteMessage'))) {
      PetHealthStorage.deleteWeightRecord(record.id);
      if (selectedPet) {
        loadRecords(selectedPet.id);
      }
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR');
  };

  const getWeightTrend = (): string => {
    if (records.length < 2) return '';
    
    const latest = records[0].weight;
    const previous = records[1].weight;
    const diff = latest - previous;
    
    if (diff > 0) {
      return `↑ ${diff.toFixed(1)}${t('weight.kg')} ${t('weight.increased')}`;
    } else if (diff < 0) {
      return `↓ ${Math.abs(diff).toFixed(1)}${t('weight.kg')} ${t('weight.decreased')}`;
    } else {
      return t('weight.noChange');
    }
  };

  const renderChart = () => {
    if (records.length === 0) return null;

    const chartRecords = [...records].reverse().slice(-10); // 최근 10개
    const maxWeight = Math.max(...chartRecords.map((r) => r.weight));
    const minWeight = Math.min(...chartRecords.map((r) => r.weight));
    const range = maxWeight - minWeight || 1;
    const chartHeight = 150;
    const chartWidth = 320;
    const pointWidth = chartWidth / Math.max(chartRecords.length - 1, 1);

    return (
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">{t('weight.weightTrend')}</h3>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 flex gap-3">
          <div className="flex flex-col justify-between pt-2.5 pb-2.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">{maxWeight.toFixed(1)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{minWeight.toFixed(1)}</span>
          </div>
          <svg className="flex-1 h-[150px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* 그리드 라인 */}
            <line x1="0" y1="0" x2={chartWidth} y2="0" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />

            {/* 라인 연결 */}
            {chartRecords.length > 1 && (
              <polyline
                points={chartRecords
                  .map((record, index) => {
                    const x = index * pointWidth;
                    const y = chartHeight - ((record.weight - minWeight) / range) * (chartHeight - 20);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                className="stroke-blue-500"
                strokeWidth="2"
              />
            )}

            {/* 데이터 포인트 */}
            {chartRecords.map((record, index) => {
              const x = index * pointWidth;
              const y = chartHeight - ((record.weight - minWeight) / range) * (chartHeight - 20);

              return (
                <g key={record.id}>
                  <circle cx={x} cy={y} r="5" className="fill-blue-500 stroke-white dark:stroke-gray-900" strokeWidth="2" />
                  {index === chartRecords.length - 1 && (
                    <text x={x} y={y - 10} textAnchor="middle" className="fill-blue-500 text-xs font-semibold">
                      {record.weight}kg
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  if (pets.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <header className="flex-shrink-0 header-safe-top pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <button className="text-2xl text-gray-900 dark:text-gray-100 hover:opacity-80 active:scale-95 transition-transform" onClick={() => navigate('/')}>
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('weight.title')}</h1>
            <div className="w-6"></div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <span className="text-6xl mb-4">🐾</span>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('weight.noPetsTitle')}</p>
          <button className="w-full py-4 px-6 bg-blue-500 text-white rounded-xl font-semibold cursor-pointer border-none mt-4" onClick={() => navigate('/pet-profile')}>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t('weight.title')}</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* 반려동물 선택 */}
      <div className="flex gap-2 px-3 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {pets.map((pet) => (
          <button
            key={pet.id}
            className={`flex-shrink-0 flex flex-col items-center gap-1 py-2.5 px-4 bg-transparent border-none rounded-xl cursor-pointer transition-colors ${
              selectedPet?.id === pet.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => setSelectedPet(pet)}
          >
            <span className="text-2xl">
              {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
            </span>
            <span className={`text-xs font-medium ${
              selectedPet?.id === pet.id 
                ? 'text-blue-500 font-semibold' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {pet.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {/* 최신 정보 카드 */}
        {records.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 m-0">{t('weight.latestWeight')}</p>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 m-0">{records[0].weight}{t('weight.kg')}</h2>
            {getWeightTrend() && (
              <p className="text-sm text-blue-500 font-semibold mb-2 m-0">{getWeightTrend()}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0">{formatDate(records[0].measureDate)}</p>
          </div>
        )}

        {/* 차트 */}
        {renderChart()}

        {/* 기록 리스트 */}
        <div className="mt-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 m-0">{t('weight.records')}</h3>

          {records.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-10 shadow-sm flex flex-col items-center text-center">
              <span className="text-6xl mb-4">⚖️</span>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 m-0">{t('weight.emptyTitle')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 m-0">{t('weight.emptySubtitle')}</p>
            </div>
          ) : (
            records.map((record, index) => {
              let diff = null;
              if (index < records.length - 1) {
                diff = record.weight - records[index + 1].weight;
              }

              return (
                <div key={record.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{record.weight}{t('weight.kg')}</span>
                    {diff !== null && diff !== 0 && (
                      <span className={`text-xs font-semibold py-1 px-2 rounded-lg ${
                        diff > 0 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-500' 
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                      }`}>
                        {diff > 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}{t('weight.kg')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 m-0">{formatDate(record.measureDate)}</p>

                  {record.notes && (
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-3 pt-3 border-t border-gray-200 dark:border-gray-800 m-0">{record.notes}</p>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <button className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-none rounded-lg text-sm font-semibold cursor-pointer" onClick={() => openModal(record)}>
                      {t('common.edit')}
                    </button>
                    <button className="flex-1 py-2.5 px-4 bg-transparent text-red-500 border border-red-500 rounded-lg text-sm font-semibold cursor-pointer" onClick={() => handleDelete(record)}>
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-w-[480px] mx-auto">
        <button className="w-full py-4 px-6 bg-blue-500 text-white rounded-xl font-semibold cursor-pointer border-none" onClick={() => openModal()}>
          {t('weight.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fadeIn" onClick={() => setModalVisible(false)}>
          <div className="w-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-2xl animate-slideUp overflow-hidden flex flex-col md:max-w-[480px] md:mx-auto md:items-center md:rounded-2xl md:max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
              <button className="bg-transparent border-none text-2xl text-gray-900 dark:text-gray-100 cursor-pointer p-2" onClick={() => setModalVisible(false)}>✕</button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0 flex-1 text-center">
                {editingRecord ? t('weight.edit') : t('weight.add')}
              </h2>
              <div className="w-10"></div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('weight.weight')} * ({t('weight.kg')})</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('weight.measureDate')} *</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 appearance-none focus:outline-none focus:border-blue-500"
                  value={measureDate}
                  onChange={(e) => setMeasureDate(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('weight.notes')}</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 resize-vertical min-h-[100px] focus:outline-none focus:border-blue-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('weight.notesPlaceholder')}
                  rows={4}
                />
              </div>

              <button className="w-full py-4 px-6 bg-blue-500 text-white rounded-xl font-semibold cursor-pointer border-none" onClick={handleSave}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
