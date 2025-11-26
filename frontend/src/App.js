// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Header />  {/* ✅ 모든 페이지 상단 공통 헤더 */}
      <div className="container mt-4">
        <Routes>
          {/* 메인 = 로그인 페이지 */}
          <Route path="/" element={<LoginPage />} />

          {/* 역할별 대시보드 */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* 나머지 이상한 주소 → 메인으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
