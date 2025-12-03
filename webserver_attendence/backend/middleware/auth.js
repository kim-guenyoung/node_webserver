const jwt = require('jsonwebtoken');

// JWT 토큰 생성
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// JWT 토큰 검증 미들웨어
const authenticate = (req, res, next) => {
  try {
    // 쿠키 또는 Authorization 헤더에서 토큰 추출
    const token = req.cookies.session_token || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: '인증 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: '유효하지 않은 토큰입니다.'
    });
  }
};

// 역할 기반 권한 체크 미들웨어
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: '인증이 필요합니다.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '권한이 없습니다.'
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  authenticate,
  authorize
};