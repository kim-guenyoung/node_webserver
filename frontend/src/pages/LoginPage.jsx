import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');

  const redirectByRole = (role) => {
    if (role === 'student') {
      navigate('/student/dashboard', { replace: true });
    } else if (role === 'professor') {
      navigate('/professor/dashboard', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  // ✅ 이미 로그인되어 있으면 즉시 redirect
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loggedInUser = await login(email, password); // ✅ Context 로그인
      redirectByRole(loggedInUser.role);
    } catch (err) {
      console.error(err);
      setError('로그인 실패: 이메일 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2 className="mb-4">로그인</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">이메일</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="text-danger mb-2">{error}</div>}

        <button type="submit" className="btn btn-primary w-100">
          로그인
        </button>
      </form>
    </div>
  );
}
