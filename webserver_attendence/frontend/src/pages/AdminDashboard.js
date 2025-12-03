import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeSessions: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    // TODO: API에서 통계 데이터 가져오기
    // 임시 데이터
    setStats({
      totalUsers: 150,
      totalCourses: 25,
      activeSessions: 8,
      pendingRequests: 12,
    });
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>관리자 대시보드</h1>
        <p>환영합니다, {user?.name}님</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon admin">👥</div>
          <div className="stat-content">
            <h3>전체 사용자</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon admin">📚</div>
          <div className="stat-content">
            <h3>개설 과목</h3>
            <p className="stat-number">{stats.totalCourses}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon admin">🎓</div>
          <div className="stat-content">
            <h3>진행 중인 강의</h3>
            <p className="stat-number">{stats.activeSessions}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon admin">⏰</div>
          <div className="stat-content">
            <h3>대기 중인 요청</h3>
            <p className="stat-number">{stats.pendingRequests}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <h2>시스템 관리</h2>
          <div className="action-buttons">
            <button className="action-btn primary">학과 관리</button>
            <button className="action-btn primary">학기 관리</button>
            <button className="action-btn primary">과목 관리</button>
            <button className="action-btn primary">사용자 관리</button>
          </div>
        </div>

        <div className="content-section">
          <h2>리포트 및 로그</h2>
          <div className="action-buttons">
            <button className="action-btn secondary">출석 통계 보기</button>
            <button className="action-btn secondary">시스템 로그</button>
            <button className="action-btn secondary">감사 로그</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;