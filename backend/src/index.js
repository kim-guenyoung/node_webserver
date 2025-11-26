const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// ⚠️ React는 보통 3000포트에서 돌리니까, 백엔드는 4000으로 바꾸는 걸 추천
const PORT = 4000;
const JWT_SECRET = 'dev-secret-change-me'; // 추후 .env로 빼기

// ----- 미들웨어 -----
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: 'http://localhost:3000', // 프론트 주소 (나중에 3001이면 여기 수정)
        credentials: true,                            // 쿠키 주고받기 허용
    })
);

// ----- 테스트용 유저 (나중에 MySQL로 교체하면 됨) -----
const testUser = [
    {
        id: 1,
        email: 'test@example.com',
        name: '홍길동',
        role: 'student',
        // 비밀번호: 1234
        passwordHash: bcrypt.hashSync('1234', 10),
    },
    {
        id: 2,
        email: 'professor@example.com',
        name: '교수',
        role: 'professor',
        passwordHash: bcrypt.hashSync('1234', 10),
    },
    {
        id: 3,
        email: 'admin@example.com',
        name: '관리자',
        role: 'admin',
        passwordHash: bcrypt.hashSync('1234', 10),
    },
    {
        id: 4,
        email: "student@example.com",
        name: "학생",
        role: "student",
        passwordHash: bcrypt.hashSync("1234", 10),
    }
];


// ----- 인증 미들웨어 -----
function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// ----- 라우트 -----

app.get('/api/attendance/my', authMiddleware, (req, res) => {
    const user = req.user;
  
    // 학생만 접근 가능하게
    if (user.role !== 'student') {
      return res.status(403).json({ message: '학생만 접근 가능합니다.' });
    }
  
    const myRecords = attendanceRecords.filter(
      (r) => r.studentEmail === user.email
    );
  
    res.json(myRecords);
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // 1) 유저 찾기
    const user = testUser.find((u) => u.email === email);
    if (!user) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 2) 비밀번호 확인
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 3) JWT 발급
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '2h' }
    );

    // 4) 쿠키로 내려주기
    res
        .cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        })
        .json({ message: '로그인 성공' });
});
// 현재 로그인한 내 정보
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
    });
});

// 로그아웃
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token').json({ message: '로그아웃 되었습니다.' });
});

// ----- 서버 시작 -----
app.listen(PORT, () => {
    console.log(`🚀 Auth 서버 running at http://localhost:${PORT}`);
});


const attendanceRecords = [
    {
      id: 1,
      studentEmail: 'student@example.com',
      subject: '웹서버프로그래밍',
      date: '2025-03-19',
      status: '출석',
    },
    {
      id: 2,
      studentEmail: 'student@example.com',
      subject: '웹서버프로그래밍',
      date: '2025-03-02',
      status: '지각',
    },
    {
      id: 3,
      studentEmail: 'student@example.com',
      subject: '심층학습',
      date: '2025-11-25',
      status: '결석',
    },
    {
      id: 4,
      studentEmail: 'test@example.com',
      subject: '심층학습',
      date: '2025-11-21',
      status: '출석',
    },
  ];