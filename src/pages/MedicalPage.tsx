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
import './MedicalPage.css';

export function MedicalPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useApp();
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
      <div className="medical-page">
        <header className="header">
          <button className="back-button" onClick={() => navigate('/')}>←</button>
          <h1 className="title">{t('medical.title')}</h1>
          <div className="placeholder"></div>
        </header>
        <div className="center-content">
          <span className="empty-icon">🐾</span>
          <p className="empty-text">{t('medical.noPetsTitle')}</p>
          <button className="button-primary" onClick={() => navigate('/pet-profile')}>
            {t('pet.register')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-page">
      <header className="header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1 className="title">{t('medical.title')}</h1>
        <div className="placeholder"></div>
      </header>

      <div className="scroll-view">
        {records.length === 0 ? (
          <div className="empty-card card">
            <span className="empty-icon">🏥</span>
            <p className="empty-text">{t('medical.emptyTitle')}</p>
            <p className="empty-subtext">{t('medical.emptySubtitle')}</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="medical-card card">
              <div className="card-header">
                <span className="pet-name-small">{getPetName(record.petId)}</span>
                <span className="date-text">{formatDate(record.visitDate)}</span>
              </div>

              <h3 className="hospital-name">🏥 {record.hospitalName}</h3>

              <div className="details-container">
                {record.symptoms && (
                  <div className="detail-row">
                    <span className="detail-label">{t('medical.symptoms')}</span>
                    <span className="detail-value">{record.symptoms}</span>
                  </div>
                )}
                
                {record.diagnosis && (
                  <div className="detail-row">
                    <span className="detail-label">{t('medical.diagnosis')}</span>
                    <span className="detail-value">{record.diagnosis}</span>
                  </div>
                )}

                {record.treatment && (
                  <div className="detail-row">
                    <span className="detail-label">{t('medical.treatment')}</span>
                    <span className="detail-value">{record.treatment}</span>
                  </div>
                )}

                {record.cost && (
                  <div className="detail-row">
                    <span className="detail-label">{t('medical.cost')}</span>
                    <span className="detail-value">
                      {record.cost.toLocaleString()}{t('medical.won')}
                    </span>
                  </div>
                )}

                {record.notes && (
                  <div className="detail-row">
                    <span className="detail-label">{t('medical.notes')}</span>
                    <span className="detail-value">{record.notes}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button className="button-secondary" onClick={() => openModal(record)}>
                  {t('common.edit')}
                </button>
                <button className="button-ghost" onClick={() => handleDelete(record)}>
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="footer">
        <button className="button-primary" onClick={() => openModal()}>
          {t('medical.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setModalVisible(false)}>✕</button>
              <h2 className="modal-title">
                {editingRecord ? t('medical.edit') : t('medical.add')}
              </h2>
              <div className="placeholder"></div>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="label">{t('pet.name')} *</label>
                <div className="pet-selector-container">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      className={`pet-selector ${selectedPetId === pet.id ? 'active' : ''}`}
                      onClick={() => setSelectedPetId(pet.id)}
                    >
                      <span className="pet-selector-emoji">
                        {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
                      </span>
                      <span className="pet-selector-name">{pet.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">{t('medical.visitDate')} *</label>
                <input
                  type="date"
                  className="input"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('medical.hospitalName')} *</label>
                <input
                  type="text"
                  className="input"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder={t('medical.hospitalPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('medical.symptoms')}</label>
                <textarea
                  className="input text-area"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={t('medical.symptomsPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('medical.diagnosis')}</label>
                <textarea
                  className="input text-area"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder={t('medical.diagnosisPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('medical.treatment')}</label>
                <textarea
                  className="input text-area"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder={t('medical.treatmentPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('medical.cost')}</label>
                <input
                  type="number"
                  className="input"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="label">{t('medical.notes')}</label>
                <textarea
                  className="input text-area"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('medical.notesPlaceholder')}
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
