const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken, authenticate } = require('../middleware/auth');

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 조회
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    const user = users[0];

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user.id, user.role);

    // 마지막 로그인 시간 업데이트
    await db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 쿠키에 토큰 저장
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    });

    // 응답 (비밀번호 제외)
    delete user.password_hash;

    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '로그인 중 오류가 발생했습니다.'
    });
  }
});

// 로그아웃
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('session_token');
  res.json({
    success: true,
    message: '로그아웃 성공'
  });
});

// 현재 사용자 정보
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, department_id, created_at, last_login_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;