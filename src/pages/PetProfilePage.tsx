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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PetHealthStorage } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import { calculateAge, generateId } from '../shared/utils';
import type { Pet } from '../shared/types';
import './PetProfilePage.css';

export function PetProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useApp();
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
  };

  const handleDelete = (pet: Pet) => {
    if (window.confirm(t('pet.alert.deleteMessage', { name: pet.name }))) {
      PetHealthStorage.deletePet(pet.id);
      loadPets();
    }
  };

  return (
    <div className="pet-profile-page">
      {/* 헤더 */}
      <header className="header">
        <button className="back-button" onClick={() => navigate('/')}>
          ←
        </button>
        <h1 className="title">{t('pet.title')}</h1>
        <div className="placeholder"></div>
      </header>

      <div className="scroll-view">
        {pets.length === 0 ? (
          <div className="empty-card card">
            <span className="empty-icon">🐾</span>
            <p className="empty-text">{t('pet.emptyTitle')}</p>
            <p className="empty-subtext">{t('pet.emptySubtitle')}</p>
          </div>
        ) : (
          pets.map((pet) => (
            <div key={pet.id} className="pet-card card">
              <div className="pet-header">
                <div className="pet-avatar">
                  <span className="pet-avatar-text">
                    {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
                  </span>
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <p className="pet-breed">
                    {pet.breed || pet.species}
                    {pet.birthDate && ` · ${calculateAge(pet.birthDate)}`}
                  </p>
                </div>
              </div>

              <div className="pet-details">
                {pet.gender && pet.gender !== 'unknown' && (
                  <div className="detail-row">
                    <span className="detail-label">{t('pet.gender')}</span>
                    <span className="detail-value">
                      {pet.gender === 'male' ? t('pet.male') : t('pet.female')}
                    </span>
                  </div>
                )}
                {pet.weight && (
                  <div className="detail-row">
                    <span className="detail-label">{t('pet.weight')}</span>
                    <span className="detail-value">{pet.weight}{t('pet.kg')}</span>
                  </div>
                )}
                {pet.birthDate && (
                  <div className="detail-row">
                    <span className="detail-label">{t('pet.birthDate')}</span>
                    <span className="detail-value">
                      {new Date(pet.birthDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}
                {pet.notes && (
                  <div className="detail-row">
                    <span className="detail-label">{t('pet.notes')}</span>
                    <span className="detail-value">{pet.notes}</span>
                  </div>
                )}
              </div>

              <div className="pet-actions">
                <button className="button-secondary" onClick={() => openModal(pet)}>
                  {t('common.edit')}
                </button>
                <button className="button-ghost" onClick={() => handleDelete(pet)}>
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 추가 버튼 */}
      <footer className="footer">
        <button className="button-primary" onClick={() => openModal()}>
          {t('pet.addButton')}
        </button>
      </footer>

      {/* 추가/수정 모달 */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setModalVisible(false)}>
                ✕
              </button>
              <h2 className="modal-title">
                {editingPet ? t('pet.edit') : t('pet.add')}
              </h2>
              <div className="placeholder"></div>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="label">{t('pet.name')} *</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('pet.namePlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('pet.species')}</label>
                <div className="radio-group">
                  {[
                    { value: t('pet.dog'), label: t('pet.dog') },
                    { value: t('pet.cat'), label: t('pet.cat') },
                    { value: t('pet.other'), label: t('pet.other') },
                  ].map((s) => (
                    <button
                      key={s.value}
                      className={`radio-button ${species === s.value ? 'active' : ''}`}
                      onClick={() => setSpecies(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">{t('pet.breed')}</label>
                <input
                  type="text"
                  className="input"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder={t('pet.breedPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('pet.gender')}</label>
                <div className="radio-group">
                  {[
                    { value: 'male', label: t('pet.male') },
                    { value: 'female', label: t('pet.female') },
                    { value: 'unknown', label: t('pet.unknown') },
                  ].map((g) => (
                    <button
                      key={g.value}
                      className={`radio-button ${gender === g.value ? 'active' : ''}`}
                      onClick={() => setGender(g.value as any)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">{t('pet.birthDate')}</label>
                <input
                  type="date"
                  className="input"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('pet.weight')} ({t('pet.kg')})</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={t('weight.weightPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="label">{t('pet.notes')}</label>
                <textarea
                  className="input text-area"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('pet.notesPlaceholder')}
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
