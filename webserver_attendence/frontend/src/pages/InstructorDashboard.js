import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI, sessionAPI } from '../services/api';
import '../styles/Dashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 내 강의 목록 가져오기
      const coursesData = await courseAPI.getCourses({ 
        instructor_id: user.id 
      });
      setCourses(coursesData.courses || []);

      // 오늘 강의 세션 가져오기
      const today = new Date().toISOString().split('T')[0];
      const sessionsData = await sessionAPI.getSessions({ 
        date: today,
        instructor_id: user.id 
      });
      setTodaySessions(sessionsData.sessions || []);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAttendance = async (sessionId) => {
    try {
      // TODO: 출석 방식 선택 모달 표시
      await sessionAPI.openAttendance(sessionId, {
        method_id: 1, // 임시: 전자출결
      });
      alert('출석이 시작되었습니다.');
      loadData();
    } catch (error) {
      alert('출석 시작 실패: ' + error.message);
    }
  };

  const handleCloseAttendance = async (sessionId) => {
    try {
      await sessionAPI.closeAttendance(sessionId);
      alert('출석이 마감되었습니다.');
      loadData();
    } catch (error) {
      alert('출석 마감 실패: ' + error.message);
    }
  };

  if (loading) {
    return <div className="dashboard loading">로딩 중...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>교원 대시보드</h1>
        <p>환영합니다, {user?.name} 교수님</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon instructor">📚</div>
          <div className="stat-content">
            <h3>담당 강의</h3>
            <p className="stat-number">{courses.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon instructor">📅</div>
          <div className="stat-content">
            <h3>오늘 강의</h3>
            <p className="stat-number">{todaySessions.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon instructor">✅</div>
          <div className="stat-content">
            <h3>대기 중인 공결</h3>
            <p className="stat-number">5</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon instructor">📝</div>
          <div className="stat-content">
            <h3>이의제기</h3>
            <p className="stat-number">3</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <h2>오늘의 강의</h2>
          {todaySessions.length === 0 ? (
            <p className="empty-message">오늘 예정된 강의가 없습니다.</p>
          ) : (
            <div className="session-list">
              {todaySessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-info">
                    <h3>{session.course_title}</h3>
                    <p>
                      {session.week}주차 | {session.start_time} - {session.end_time}
                    </p>
                    {session.room && <p>강의실: {session.room}</p>}
                  </div>
                  <div className="session-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => handleOpenAttendance(session.id)}
                    >
                      출석 시작
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleCloseAttendance(session.id)}
                    >
                      출석 마감
                    </button>
                    <button className="action-btn secondary">
                      출석 현황
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-section">
          <h2>내 강의 목록</h2>
          {courses.length === 0 ? (
            <p className="empty-message">담당 강의가 없습니다.</p>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <p>{course.code}</p>
                  <p>{course.grade}학년</p>
                  <button className="action-btn primary">강의 관리</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-section">
          <h2>빠른 작업</h2>
          <div className="action-buttons">
            <button className="action-btn secondary">공결 승인 처리</button>
            <button className="action-btn secondary">이의제기 확인</button>
            <button className="action-btn secondary">전체 공지 작성</button>
            <button className="action-btn secondary">공강 투표 생성</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;