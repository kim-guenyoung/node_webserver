import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'instructor':
        return '교원';
      case 'student':
        return '학생';
      default:
        return '사용자';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>출석 관리 시스템</h2>
        </div>

        <div className="navbar-menu">
          <div className="navbar-user">
            <span className="user-role">{getRoleName(user?.role)}</span>
            <span className="user-name">{user?.name}</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;