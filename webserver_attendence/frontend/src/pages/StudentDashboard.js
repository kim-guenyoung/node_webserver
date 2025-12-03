import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI, attendanceAPI, sessionAPI } from '../services/api';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 수강 중인 과목 목록
      const coursesData = await courseAPI.getCourses({ 
        student_id: user.id 
      });
      setCourses(coursesData.courses || []);

      // 오늘 강의 세션
      const today = new Date().toISOString().split('T')[0];
      const sessionsData = await sessionAPI.getSessions({ 
        date: today,
        student_id: user.id 
      });
      setTodaySessions(sessionsData.sessions || []);

      // 내 출석 통계
      const statsData = await attendanceAPI.getStudentAttendance(user.id);
      setAttendanceStats(statsData.statistics || null);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAttendance = async (sessionId) => {
    try {
      const verificationCode = prompt('인증번호를 입력하세요 (전자출결인 경우 비워두세요):');
      
      await attendanceAPI.checkAttendance({
        session_id: sessionId,
        verification_code: verificationCode || undefined,
      });
      
      alert('출석 체크가 완료되었습니다!');
      loadData();
    } catch (error) {
      alert('출석 체크 실패: ' + error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return <div className="dashboard loading">로딩 중...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>학생 대시보드</h1>
        <p>환영합니다, {user?.name}님</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon student">📚</div>
          <div className="stat-content">
            <h3>수강 과목</h3>
            <p className="stat-number">{courses.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon student">✅</div>
          <div className="stat-content">
            <h3>출석</h3>
            <p className="stat-number">{attendanceStats?.present || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon student">⏰</div>
          <div className="stat-content">
            <h3>지각</h3>
            <p className="stat-number">{attendanceStats?.late || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon student">❌</div>
          <div className="stat-content">
            <h3>결석</h3>
            <p className="stat-number">{attendanceStats?.absent || 0}</p>
          </div>
        </div>
      </div>

      {attendanceStats && attendanceStats.absent >= 2 && (
        <div className="warning-banner">
          ⚠️ 결석 {attendanceStats.absent}회입니다. 
          {attendanceStats.absent >= 3 ? ' 위험 단계입니다!' : ' 주의하세요!'}
        </div>
      )}

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
                    <span className={`status-badge ${session.attendance_status || 'pending'}`}>
                      {session.attendance_status === 'present' && '출석'}
                      {session.attendance_status === 'late' && '지각'}
                      {session.attendance_status === 'absent' && '결석'}
                      {!session.attendance_status && '미체크'}
                    </span>
                  </div>
                  <div className="session-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => handleCheckAttendance(session.id)}
                      disabled={session.attendance_status}
                    >
                      {session.attendance_status ? '체크 완료' : '출석 체크'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-section">
          <h2>수강 과목</h2>
          {courses.length === 0 ? (
            <p className="empty-message">수강 중인 과목이 없습니다.</p>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-card">
                  <h3>{course.title}</h3>
                  <p>{course.code}</p>
                  <p>{course.instructor_name} 교수님</p>
                  <button className="action-btn primary">출석 현황</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-section">
          <h2>빠른 작업</h2>
          <div className="action-buttons">
            <button className="action-btn secondary">공결 신청</button>
            <button className="action-btn secondary">출석 이의제기</button>
            <button className="action-btn secondary">메시지 보내기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;