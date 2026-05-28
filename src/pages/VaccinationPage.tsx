/**
 * VaccinationPage.tsx
 * 
 * 예방접종 기록 페이지
 * - 예방접종 목록 표시
 * - 예방접종 추가/수정/삭제
 * - 다가오는 접종 배지
 * - 기한 지난 접종 표시
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import { generateId } from '../shared/utils';
import type { Pet, Vaccination } from '../shared/types';
import './VaccinationPage.css';

export function VaccinationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useApp();
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
      <div className="vaccination-page">
        <header className="header">
          <button className="back-button" onClick={() => navigate('/')}>←</button>
          <h1 className="title">{t('vaccination.title')}</h1>
          <div className="placeholder"></div>
        </header>
        <div className="center-content">
          <span className="empty-icon">🐾</span>
          <p className="empty-text">{t('vaccination.noPetsTitle')}</p>
          <button className="button-primary" onClick={() => navigate('/pet-profile')}>
            {t('pet.register')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vaccination-page">
      <header className="header">
        <button className="back-button" onClick={() => navigate('/')}>←</button>
        <h1 className="title">{t('vaccination.title')}</h1>
        <div className="placeholder"></div>
      </header>

      <div className="scroll-view">
        {vaccinations.length === 0 ? (
          <div className="empty-card card">
            <span className="empty-icon">💉</span>
            <p className="empty-text">{t('vaccination.emptyTitle')}</p>
            <p className="empty-subtext">{t('vaccination.emptySubtitle')}</p>
          </div>
        ) : (
          vaccinations.map((vaccination) => {
            const daysUntil = vaccination.nextDueDate 
              ? getDaysUntil(vaccination.nextDueDate) 
              : null;
            const isUpcoming = daysUntil !== null && daysUntil > 0 && daysUntil <= 30;
            const isOverdue = daysUntil !== null && daysUntil < 0;

            return (
              <div key={vaccination.id} className="vaccination-card card">
                <div className="card-header">
                  <span className="pet-name-small">{getPetName(vaccination.petId)}</span>
                  {(isUpcoming || isOverdue) && (
                    <span className={`badge ${isOverdue ? 'badge-error' : 'badge-primary'}`}>
                      {isOverdue 
                        ? t('vaccination.overdue') 
                        : t('vaccination.daysLeft', { days: daysUntil })}
                    </span>
                  )}
                </div>

                <h3 className="vaccine-name">💉 {vaccination.vaccineName}</h3>

                <div className="details-container">
                  <div className="detail-row">
                    <span className="detail-label">{t('vaccination.vaccinationDate')}</span>
                    <span className="detail-value">{formatDate(vaccination.vaccinationDate)}</span>
                  </div>
                  
                  {vaccination.nextDueDate && (
                    <div className="detail-row">
                      <span className="detail-label">{t('vaccination.nextDue')}</span>
                      <span className={`detail-value ${isOverdue ? 'text-error' : ''}`}>
                        {formatDate(vaccination.nextDueDate)}
                      </span>
                    </div>
                  )}

                  {vaccination.hospitalName && (
                    <div className="detail-row">
                      <span className="detail-label">{t('vaccination.hospital')}</span>
                      <span className="detail-value">{vaccination.hospitalName}</span>
                    </div>
                  )}

                  {vaccination.notes && (
                    <div className="detail-row">
                      <span className="detail-label">{t('vaccination.notes')}</span>
                      <span className="detail-value">{vaccination.notes}</span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button className="button-secondary" onClick={() => openModal(vaccination)}>
                    {t('common.edit')}
                  </button>
                  <button className="button-ghost" onClick={() => handleDelete(vaccination)}>
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="footer">
        <button className="button-primary" onClick={() => openModal()}>
          {t('vaccination.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setModalVisible(false)}>✕</button>
              <h2 className="modal-title">
                {editingVaccination ? t('vaccination.edit') : t('vaccination.add')}
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
                <label className="label">{t('vaccination.vaccineName')} *</label>
                <input
                  type="text"
                  className="input"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder={t('vaccination.vaccineNamePlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('vaccination.vaccinationDate')} *</label>
                <input
                  type="date"
                  className="input"
                  value={vaccinationDate}
                  onChange={(e) => setVaccinationDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('vaccination.nextDue')}</label>
                <input
                  type="date"
                  className="input"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('vaccination.hospital')}</label>
                <input
                  type="text"
                  className="input"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder={t('vaccination.hospitalPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('vaccination.notes')}</label>
                <textarea
                  className="input text-area"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('vaccination.notesPlaceholder')}
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
