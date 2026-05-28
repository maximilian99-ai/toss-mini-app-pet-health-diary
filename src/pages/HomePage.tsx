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
import type { Pet, Vaccination, MedicalRecord } from '../shared/types';
import { formatDate } from '../shared/utils';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useApp();
  const [pets, setPets] = useState<Pet[]>([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<Vaccination[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);

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
    <div className="home-page">
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">{t('app.title')}</h1>
          <button 
            className="settings-button"
            onClick={() => navigate('/settings')}
          >
            ⚙️
          </button>
        </div>
      </header>

      <div className="scroll-view">
        {/* 빠른 시작 버튼 */}
        <section className="section">
          <div className="quick-buttons">
            <button
              className="quick-button quick-button-profile"
              onClick={() => navigate('/pet-profile')}
            >
              <span className="quick-button-icon">🐶</span>
              <span className="quick-button-text">{t('home.profile')}</span>
            </button>

            <button
              className="quick-button quick-button-vaccination"
              onClick={() => navigate('/vaccination')}
            >
              <span className="quick-button-icon">💉</span>
              <span className="quick-button-text">{t('home.vaccination')}</span>
            </button>

            <button
              className="quick-button quick-button-medical"
              onClick={() => navigate('/medical')}
            >
              <span className="quick-button-icon">🏥</span>
              <span className="quick-button-text">{t('home.medical')}</span>
            </button>

            <button
              className="quick-button quick-button-weight"
              onClick={() => navigate('/weight')}
            >
              <span className="quick-button-icon">⚖️</span>
              <span className="quick-button-text">{t('home.weight')}</span>
            </button>
          </div>
        </section>

        {/* 내 반려동물 */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">{t('pet.list')}</h2>
            <button 
              className="section-link"
              onClick={() => navigate('/pet-profile')}
            >
              ›
            </button>
          </div>

          {pets.length === 0 ? (
            <div className="empty-card card">
              <span className="empty-icon">🐾</span>
              <p className="empty-text">{t('home.noPets')}</p>
              <button
                className="button-primary"
                onClick={() => navigate('/pet-profile')}
              >
                {t('pet.add')}
              </button>
            </div>
          ) : (
            <div className="pet-cards-container">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  className="pet-card"
                  onClick={() => navigate(`/pet-profile/${pet.id}`)}
                >
                  <div className="pet-avatar">
                    <span className="pet-avatar-text">
                      {pet.species === t('pet.dog') ? '🐶' : pet.species === t('pet.cat') ? '🐱' : '🐾'}
                    </span>
                  </div>
                  <p className="pet-name">{pet.name}</p>
                  <p className="pet-breed">{pet.breed || pet.species}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 다가오는 예방접종 */}
        {upcomingVaccinations.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">{t('home.upcomingVaccinations')}</h2>
              <button 
                className="section-link"
                onClick={() => navigate('/vaccination')}
              >
                ›
              </button>
            </div>

            {upcomingVaccinations.map((vaccination) => (
              <div key={vaccination.id} className="list-item card">
                <div className="list-item-header">
                  <p className="list-item-title">
                    💉 {vaccination.vaccineName}
                  </p>
                  <span className="list-item-date">
                    {formatDate(vaccination.nextDueDate!)}
                  </span>
                </div>
                <p className="list-item-subtitle">
                  {getPetName(vaccination.petId)}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* 최근 병원 기록 */}
        {recentRecords.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">{t('home.recentMedical')}</h2>
              <button 
                className="section-link"
                onClick={() => navigate('/medical')}
              >
                ›
              </button>
            </div>

            {recentRecords.map((record) => (
              <div key={record.id} className="list-item card">
                <div className="list-item-header">
                  <p className="list-item-title">
                    🏥 {record.hospitalName}
                  </p>
                  <span className="list-item-date">
                    {formatDate(record.visitDate)}
                  </span>
                </div>
                <p className="list-item-subtitle">
                  {getPetName(record.petId)} - {record.diagnosis || record.symptoms}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
