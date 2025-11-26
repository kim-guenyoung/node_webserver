import React, { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 처음 앱 로딩 시: 쿠키 기반 로그인 상태 확인
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await client.get('/api/auth/me');
        setUser(res.data);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // 🔹 로그인 처리 (UI 즉시 갱신)
  const login = async (email, password) => {
    await client.post('/api/auth/login', { email, password });
    const res = await client.get('/api/auth/me');
    setUser(res.data);    // ✅ 여기서 즉시 로그인 상태 반영
    return res.data;
  };

  // 🔹 로그아웃 처리 (UI 즉시 갱신)
  const logout = async () => {
    try {
      await client.post('/api/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);      // ✅ 여기서 즉시 로그아웃 상태 반영
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
