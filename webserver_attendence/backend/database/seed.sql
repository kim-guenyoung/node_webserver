USE attendance_db;

-- 학과 데이터
INSERT INTO departments (name, code) VALUES
('소프트웨어학과', 'SW'),
('컴퓨터공학과', 'CE'),
('정보통신공학과', 'ICE');

-- 사용자 데이터 (비밀번호: 모두 '1234')
-- bcrypt 해시: $2b$10$YourHashHere... (실제로는 bcrypt로 해싱해야 함)
INSERT INTO users (name, email, password_hash, role, department_id) VALUES
('관리자', 'admin@school.ac.kr', '$2b$10$rQZ5YKj5xJxK5YKj5xJxK.YKj5xJxK5YKj5xJxK5YKj5xJxK5YKj5e', 'admin', NULL),
('홍길동 교수', 'professor@school.ac.kr', '$2b$10$rQZ5YKj5xJxK5YKj5xJxK.YKj5xJxK5YKj5xJxK5YKj5xJxK5YKj5e', 'instructor', 1),
('김철수', 'student@school.ac.kr', '$2b$10$rQZ5YKj5xJxK5YKj5xJxK.YKj5xJxK5YKj5xJxK5YKj5xJxK5YKj5e', 'student', 1),
('이영희', 'student2@school.ac.kr', '$2b$10$rQZ5YKj5xJxK5YKj5xJxK.YKj5xJxK5YKj5xJxK5YKj5xJxK5YKj5e', 'student', 1),
('박민수', 'student3@school.ac.kr', '$2b$10$rQZ5YKj5xJxK5YKj5xJxK.YKj5xJxK5YKj5xJxK5YKj5xJxK5YKj5e', 'student', 1);

-- 학기 데이터
INSERT INTO semesters (year, term, start_date, end_date) VALUES
(2025, '2학기', '2025-09-01', '2025-12-20');

-- 과목 데이터
INSERT INTO courses (title, code, department_id, semester_id, instructor_id, grade, is_active) VALUES
('웹프로그래밍', 'SW301', 1, 1, 2, 3, 1),
('데이터베이스', 'SW302', 1, 1, 2, 3, 1),
('알고리즘', 'SW201', 1, 1, 2, 2, 1);

-- 강의 세션 데이터 (예시: 웹프로그래밍 1~3주차)
INSERT INTO class_sessions (course_id, week, date, start_time, end_time, room) VALUES
(1, 1, '2025-09-03', '09:00:00', '11:00:00', '공학관 301'),
(1, 2, '2025-09-10', '09:00:00', '11:00:00', '공학관 301'),
(1, 3, '2025-09-17', '09:00:00', '11:00:00', '공학관 301');

-- 수강신청 데이터
INSERT INTO enrollments (course_id, student_id, status) VALUES
(1, 3, 'enrolled'),
(1, 4, 'enrolled'),
(1, 5, 'enrolled'),
(2, 3, 'enrolled'),
(2, 4, 'enrolled');

-- 출석 데이터 초기화 (학생들의 기본 출석 레코드 생성)
INSERT INTO attendances (session_id, student_id, status_code) VALUES
(1, 3, 0),
(1, 4, 0),
(1, 5, 0),
(2, 3, 0),
(2, 4, 0),
(2, 5, 0);