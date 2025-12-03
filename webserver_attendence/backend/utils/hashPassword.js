const bcrypt = require('bcrypt');

// 비밀번호를 bcrypt로 해싱하는 유틸리티
async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

// 여러 비밀번호 해싱
async function hashMultiplePasswords() {
  const passwords = ['1234', 'admin123', 'prof123', 'student123'];
  
  console.log('=== 비밀번호 해싱 결과 ===\n');
  
  for (const password of passwords) {
    const hash = await hashPassword(password);
    console.log(`비밀번호: ${password}`);
    console.log(`해시: ${hash}\n`);
  }
}

// 테스트 계정 SQL 생성
async function generateTestAccountSQL() {
  const hash1234 = await hashPassword('1234');
  
  console.log('=== 테스트 계정 SQL ===\n');
  console.log(`-- 비밀번호: 모두 '1234'`);
  console.log(`INSERT INTO users (name, email, password_hash, role, department_id) VALUES`);
  console.log(`('관리자', 'admin@school.ac.kr', '${hash1234}', 'admin', NULL),`);
  console.log(`('홍길동 교수', 'professor@school.ac.kr', '${hash1234}', 'instructor', 1),`);
  console.log(`('김철수', 'student@school.ac.kr', '${hash1234}', 'student', 1),`);
  console.log(`('이영희', 'student2@school.ac.kr', '${hash1234}', 'student', 1),`);
  console.log(`('박민수', 'student3@school.ac.kr', '${hash1234}', 'student', 1);`);
}

// 실행
if (require.main === module) {
  generateTestAccountSQL();
}

module.exports = { hashPassword };