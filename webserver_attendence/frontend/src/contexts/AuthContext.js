import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 로컬스토리지에서 사용자 정보 복원
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 로그인 - Mock 버전 (백엔드 없이 테스트)
  const login = async (email, password) => {
    // Mock 사용자 데이터
    const mockUsers = {
      'admin@school.ac.kr': {
        id: 1,
        email: 'admin@school.ac.kr',
        name: '관리자',
        role: 'admin',
        department_id: null,
      },
      'professor@school.ac.kr': {
        id: 2,
        email: 'professor@school.ac.kr',
        name: '홍길동 교수',
        role: 'instructor',
        department_id: 1,
      },
      'student@school.ac.kr': {
        id: 3,
        email: 'student@school.ac.kr',
        name: '김철수',
        role: 'student',
        department_id: 1,
      },
    };

    // 0.5초 대기 (실제 API 호출처럼)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = mockUsers[email];
    
    if (mockUser && password.length >= 4) {
      // Mock 토큰 생성
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return { success: true };
    }
    
    return { 
      success: false, 
      error: '이메일 또는 비밀번호가 올바르지 않습니다.' 
    };
  };

  // 로그아웃
  const logout = async () => {
    try {
      // 실제 API 호출 (백엔드 준비 시)
      // await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 로컬스토리지 정리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // 사용자 정보 갱신
  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      logout();
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};