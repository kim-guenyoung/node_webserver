import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user, isAdmin, isInstructor, isStudent } = useAuth();

  if (!user) {
    return null;
  }

  // 역할에 따라 다른 대시보드 렌더링
  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isInstructor) {
    return <InstructorDashboard />;
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>알 수 없는 사용자 역할입니다.</h2>
      <p>관리자에게 문의하세요.</p>
    </div>
  );
};

export default Dashboard;