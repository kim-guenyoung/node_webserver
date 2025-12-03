import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

// 레이아웃 컴포넌트
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* 로그인 페이지 */}
            <Route path="/login" element={<Login />} />

            {/* 대시보드 - 로그인 필요 */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 루트 경로 - 대시보드로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 권한 없음 페이지 */}
            <Route
              path="/unauthorized"
              element={
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>접근 권한이 없습니다</h2>
                  <p>이 페이지에 접근할 권한이 없습니다.</p>
                </div>
              }
            />

            {/* 404 페이지 */}
            <Route
              path="*"
              element={
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>404 - 페이지를 찾을 수 없습니다</h2>
                  <p>요청하신 페이지가 존재하지 않습니다.</p>
                </div>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;