/* -----------------------------------------------------
   0. DATABASE 생성
----------------------------------------------------- */
DROP DATABASE IF EXISTS attendance_system;
CREATE DATABASE attendance_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE attendance_system;


/* -----------------------------------------------------
   1. 기본 마스터 테이블
----------------------------------------------------- */

-- 1-1. 학과
CREATE TABLE departments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 1-2. 학기
CREATE TABLE semesters (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    term VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 1-3. 사용자 (관리자 / 교원 / 학생)
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role ENUM('ADMIN', 'INSTRUCTOR', 'STUDENT') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;


-- 1-4. 과목(강의)
CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    department_id INT UNSIGNED NOT NULL,
    semester_id INT UNSIGNED NOT NULL,
    instructor_id INT UNSIGNED NOT NULL,
    grade TINYINT UNSIGNED NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_courses_semester
        FOREIGN KEY (semester_id) REFERENCES semesters(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_courses_instructor
        FOREIGN KEY (instructor_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


-- 1-5. 수업 회차(주차별 일정)
CREATE TABLE class_sessions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id INT UNSIGNED NOT NULL,
    week TINYINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(100) NULL,
    attendance_method_id INT UNSIGNED NULL,
    is_canceled TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_sessions_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


-- 1-6. 수강 신청
CREATE TABLE enrollments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    status ENUM('ENROLLED', 'DROPPED') NOT NULL DEFAULT 'ENROLLED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_enrollments UNIQUE (course_id, student_id),
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


/* -----------------------------------------------------
   2. 출석 관련
----------------------------------------------------- */

-- 2-1. 출석 상태 코드 (0~4)
CREATE TABLE attendance_status_codes (
    code TINYINT UNSIGNED PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL
) ENGINE=InnoDB;

INSERT INTO attendance_status_codes (code, name, description) VALUES
(0, '미정', '아직 출석이 확정되지 않음'),
(1, '출석', '정상 출석'),
(2, '지각', '지각'),
(3, '결석', '무단 결석'),
(4, '공결', '공결 승인');


-- 2-2. 출석 방식
CREATE TABLE attendance_methods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL
) ENGINE=InnoDB;

INSERT INTO attendance_methods (name, description) VALUES
('ELECTRONIC', '전자출결'),
('PIN', '인증번호 방식'),
('ROLL_CALL', '호명 방식');


-- class_sessions와 출석방식 FK 연결
ALTER TABLE class_sessions
  ADD CONSTRAINT fk_class_sessions_attendance_method
  FOREIGN KEY (attendance_method_id)
  REFERENCES attendance_methods(id)
  ON UPDATE CASCADE ON DELETE SET NULL;


-- 2-3. 출석 기록
CREATE TABLE attendances (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    status_code TINYINT UNSIGNED NOT NULL,
    checked_at DATETIME NULL,
    method_id INT UNSIGNED NULL,
    instructor_id INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_changed TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT uq_attendance UNIQUE (session_id, student_id),
    CONSTRAINT fk_attendance_session FOREIGN KEY (session_id)
        REFERENCES class_sessions(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_attendance_status FOREIGN KEY (status_code)
        REFERENCES attendance_status_codes(code)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_attendance_method FOREIGN KEY (method_id)
        REFERENCES attendance_methods(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_attendance_instructor FOREIGN KEY (instructor_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;


/* -----------------------------------------------------
   3. 공결 및 이의제기
----------------------------------------------------- */

-- 3-1. 파일 테이블
CREATE TABLE files (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uploader_id INT UNSIGNED NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NULL,
    size BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_files_uploader
        FOREIGN KEY (uploader_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


-- 3-2. 공결 신청
CREATE TABLE excuse_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    reason_text TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    teacher_comment TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at DATETIME NULL,
    CONSTRAINT fk_excuse_session FOREIGN KEY (session_id)
        REFERENCES class_sessions(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_excuse_student FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


-- 3-3. 공결 신청 파일 매핑
CREATE TABLE excuse_request_files (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    excuse_request_id INT UNSIGNED NOT NULL,
    file_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_excuse_file_request FOREIGN KEY (excuse_request_id)
        REFERENCES excuse_requests(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_excuse_file_file FOREIGN KEY (file_id)
        REFERENCES files(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


-- 3-4. 출석 이의제기
CREATE TABLE attendance_appeals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attendance_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    teacher_comment TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at DATETIME NULL,
    CONSTRAINT fk_appeal_attendance FOREIGN KEY (attendance_id)
        REFERENCES attendances(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_appeal_student FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


/* -----------------------------------------------------
   4. 알림/메시지/공강 투표
----------------------------------------------------- */

-- 4-1. 알림 본문
CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_by INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    related_course_id INT UNSIGNED NULL,
    related_session_id INT UNSIGNED NULL,
    CONSTRAINT fk_notifications_creator
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_notifications_course
        FOREIGN KEY (related_course_id) REFERENCES courses(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_notifications_session
        FOREIGN KEY (related_session_id) REFERENCES class_sessions(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;


-- 4-2. 알림 대상자
CREATE TABLE notification_targets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notification_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at DATETIME NULL,
    CONSTRAINT fk_notification_targets_notification
        FOREIGN KEY (notification_id) REFERENCES notifications(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_notification_targets_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


-- 4-3. 개인 메시지
CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT UNSIGNED NOT NULL,
    to_user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at DATETIME NULL,
    CONSTRAINT fk_messages_from FOREIGN KEY (from_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_messages_to FOREIGN KEY (to_user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_messages_course FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;


-- 4-4. 공강 투표
CREATE TABLE class_polls (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id INT UNSIGNED NOT NULL,
    session_id INT UNSIGNED NULL,
    created_by INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME NULL,
    CONSTRAINT fk_polls_course FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_polls_session FOREIGN KEY (session_id)
        REFERENCES class_sessions(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_polls_creator FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


-- 4-5. 공강 투표 결과
CREATE TABLE class_poll_votes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    poll_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    choice ENUM('YES', 'NO') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_poll_vote UNIQUE (poll_id, student_id),
    CONSTRAINT fk_poll_votes_poll FOREIGN KEY (poll_id)
        REFERENCES class_polls(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_poll_votes_student FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


/* -----------------------------------------------------
   5. 감사 로그 (선택)
----------------------------------------------------- */

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INT UNSIGNED NOT NULL,
    before_value JSON NULL,
    after_value JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

users