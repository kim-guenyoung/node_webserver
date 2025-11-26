import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar navbar-light bg-light px-3">
      <Link className="navbar-brand" to="/">
        출석 관리 시스템
      </Link>

      <div className="ms-auto d-flex align-items-center">
        {user && (
          <span className="me-3">
            {user.name} ({user.role})
          </span>
        )}

        {user ? (
          <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <Link to="/" className="btn btn-primary btn-sm">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
