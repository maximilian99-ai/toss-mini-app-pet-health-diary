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
import './WeightPage.css';

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
      <div className="chart-container">
        <h3 className="chart-title">{t('weight.weightTrend')}</h3>
        <div className="chart">
          <div className="y-axis">
            <span className="y-axis-label">{maxWeight.toFixed(1)}</span>
            <span className="y-axis-label">{minWeight.toFixed(1)}</span>
          </div>
          <svg className="chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* 그리드 라인 */}
            <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="var(--color-border)" strokeWidth="1" />
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="var(--color-border)" strokeWidth="1" />
            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="var(--color-border)" strokeWidth="1" />

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
                stroke="var(--color-primary)"
                strokeWidth="2"
              />
            )}

            {/* 데이터 포인트 */}
            {chartRecords.map((record, index) => {
              const x = index * pointWidth;
              const y = chartHeight - ((record.weight - minWeight) / range) * (chartHeight - 20);

              return (
                <g key={record.id}>
                  <circle cx={x} cy={y} r="5" fill="var(--color-primary)" stroke="var(--color-surface)" strokeWidth="2" />
                  {index === chartRecords.length - 1 && (
                    <text x={x} y={y - 10} textAnchor="middle" fill="var(--color-primary)" fontSize="12" fontWeight="600">
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
      <div className="weight-page">
        <header className="header">
          <button className="back-button" onClick={() => navigate('/')}>←</button>
          <h1 className="title">{t('weight.title')}</h1>
          <div className="placeholder"></div>
        </header>
        <div className="center-content">
          <span className="empty-icon">🐾</span>
          <p className="empty-text">{t('weight.noPetsTitle')}</p>
          <button className="button-primary" onClick={() => navigate('/pet-profile')}>
            {t('pet.register')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weight-page">
      <header className="header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1 className="title">{t('weight.title')}</h1>
        <div className="placeholder"></div>
      </header>

      {/* 반려동물 선택 */}
      <div className="pet-selector-bar">
        {pets.map((pet) => (
          <button
            key={pet.id}
            className={`pet-tab ${selectedPet?.id === pet.id ? 'active' : ''}`}
            onClick={() => setSelectedPet(pet)}
          >
            <span className="pet-tab-emoji">
              {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
            </span>
            <span className="pet-tab-name">{pet.name}</span>
          </button>
        ))}
      </div>

      <div className="scroll-view">
        {/* 최신 정보 카드 */}
        {records.length > 0 && (
          <div className="latest-card card">
            <p className="latest-title">{t('weight.latestWeight')}</p>
            <h2 className="latest-weight">{records[0].weight}{t('weight.kg')}</h2>
            {getWeightTrend() && (
              <p className="latest-trend">{getWeightTrend()}</p>
            )}
            <p className="latest-date">{formatDate(records[0].measureDate)}</p>
          </div>
        )}

        {/* 차트 */}
        {renderChart()}

        {/* 기록 리스트 */}
        <div className="records-section">
          <h3 className="section-title">{t('weight.records')}</h3>

          {records.length === 0 ? (
            <div className="empty-card card">
              <span className="empty-icon">⚖️</span>
              <p className="empty-text">{t('weight.emptyTitle')}</p>
              <p className="empty-subtext">{t('weight.emptySubtitle')}</p>
            </div>
          ) : (
            records.map((record, index) => {
              let diff = null;
              if (index < records.length - 1) {
                diff = record.weight - records[index + 1].weight;
              }

              return (
                <div key={record.id} className="record-card card">
                  <div className="record-header">
                    <span className="record-weight">{record.weight}{t('weight.kg')}</span>
                    {diff !== null && diff !== 0 && (
                      <span className={`record-diff ${diff > 0 ? 'diff-up' : 'diff-down'}`}>
                        {diff > 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}{t('weight.kg')}
                      </span>
                    )}
                  </div>

                  <p className="record-date">{formatDate(record.measureDate)}</p>

                  {record.notes && (
                    <p className="record-notes">{record.notes}</p>
                  )}

                  <div className="record-actions">
                    <button className="button-secondary" onClick={() => openModal(record)}>
                      {t('common.edit')}
                    </button>
                    <button className="button-ghost" onClick={() => handleDelete(record)}>
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <footer className="footer">
        <button className="button-primary" onClick={() => openModal()}>
          {t('weight.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setModalVisible(false)}>✕</button>
              <h2 className="modal-title">
                {editingRecord ? t('weight.edit') : t('weight.add')}
              </h2>
              <div className="placeholder"></div>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="label">{t('weight.weight')} * ({t('weight.kg')})</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <div className="form-group">
                <label className="label">{t('weight.measureDate')} *</label>
                <input
                  type="date"
                  className="input"
                  value={measureDate}
                  onChange={(e) => setMeasureDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('weight.notes')}</label>
                <textarea
                  className="input text-area"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('weight.notesPlaceholder')}
                  rows={4}
                />
              </div>

              <button className="button-primary" onClick={handleSave}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
