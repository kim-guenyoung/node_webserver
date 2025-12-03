const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// 라우트 import
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const sessionRoutes = require('./routes/sessions');
const attendanceRoutes = require('./routes/attendance');

// API 라우트
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '서버가 정상적으로 실행 중입니다.',
    timestamp: new Date()
  });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || '서버 오류가 발생했습니다.'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   출석 관리 시스템 백엔드 서버 시작      ║
╠═══════════════════════════════════════════╣
║   포트: ${PORT}                           ║
║   환경: ${process.env.NODE_ENV || 'development'}                  ║
║   URL: http://localhost:${PORT}           ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;