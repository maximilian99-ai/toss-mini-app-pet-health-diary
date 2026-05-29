/**
 * App.tsx
 * 
 * 메인 애플리케이션
 * - React Router 기반 라우팅
 * - 반려동물 건강 다이어리 앱
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { PetProfilePage } from './pages/PetProfilePage';
import { VaccinationPage } from './pages/VaccinationPage';
import { MedicalPage } from './pages/MedicalPage';
import { WeightPage } from './pages/WeightPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pet-profile" element={<PetProfilePage />} />
        <Route path="/vaccination" element={<VaccinationPage />} />
        <Route path="/medical" element={<MedicalPage />} />
        <Route path="/weight" element={<WeightPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

