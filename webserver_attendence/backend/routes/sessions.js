const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// 모든 라우트에 인증 필요
router.use(authenticate);

// 강의 세션 목록 조회
router.get('/', async (req, res) => {
  try {
    const { course_id, week, date, instructor_id, student_id } = req.query;

    let query = `
      SELECT 
        cs.*,
        c.title as course_title, c.code as course_code,
        am.name as attendance_method_name
      FROM class_sessions cs
      JOIN courses c ON cs.course_id = c.id
      LEFT JOIN attendance_methods am ON cs.attendance_method_id = am.id
      WHERE 1=1
    `;
    
    const params = [];

    if (course_id) {
      query += ' AND cs.course_id = ?';
      params.push(course_id);
    }

    if (week) {
      query += ' AND cs.week = ?';
      params.push(week);
    }

    if (date) {
      query += ' AND cs.date = ?';
      params.push(date);
    }

    if (instructor_id) {
      query += ' AND c.instructor_id = ?';
      params.push(instructor_id);
    }

    // 학생인 경우 본인이 수강하는 세션만
    if (student_id && req.user.role === 'student') {
      query = `
        SELECT 
          cs.*,
          c.title as course_title, c.code as course_code,
          am.name as attendance_method_name,
          a.status_code as attendance_status
        FROM class_sessions cs
        JOIN courses c ON cs.course_id = c.id
        LEFT JOIN attendance_methods am ON cs.attendance_method_id = am.id
        JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN attendances a ON cs.id = a.session_id AND a.student_id = ?
        WHERE e.student_id = ? AND e.status = 'enrolled'
      `;
      params.unshift(student_id, student_id);
    }

    query += ' ORDER BY cs.date DESC, cs.start_time ASC';

    const [sessions] = await db.query(query, params);

    res.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '강의 세션 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 세션의 출석 현황 조회 (실시간 대시보드)
router.get('/:session_id/attendance', authorize('instructor', 'admin', 'student'), async (req, res) => {
  try {
    const sessionId = req.params.session_id;

    // 세션 정보
    const [sessions] = await db.query(
      `SELECT cs.*, c.title as course_title, c.code as course_code
       FROM class_sessions cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.id = ?`,
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '강의 세션을 찾을 수 없습니다.'
      });
    }

    // 출석 현황
    const [attendances] = await db.query(
      `SELECT 
        a.*,
        u.name as student_name, u.email as student_email,
        asc.name as status_name
       FROM attendances a
       JOIN users u ON a.student_id = u.id
       JOIN attendance_status_codes asc ON a.status_code = asc.code
       WHERE a.session_id = ?
       ORDER BY u.name`,
      [sessionId]
    );

    // 통계
    const statistics = {
      total: attendances.length,
      present: attendances.filter(a => a.status_code === 1).length,
      late: attendances.filter(a => a.status_code === 2).length,
      absent: attendances.filter(a => a.status_code === 3).length,
      excused: attendances.filter(a => a.status_code === 4).length,
      pending: attendances.filter(a => a.status_code === 0).length
    };

    res.json({
      success: true,
      session: sessions[0],
      attendances,
      statistics
    });

  } catch (error) {
    console.error('Get session attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 현황을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 출석 시작 (교원)
router.post('/:session_id/attendance/open', authorize('instructor'), async (req, res) => {
  try {
    const sessionId = req.params.session_id;
    const { method_id, verification_code } = req.body;

    if (!method_id) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '출석 방식을 선택해주세요.'
      });
    }

    // 세션에 출석 방식 설정
    await db.query(
      'UPDATE class_sessions SET attendance_method_id = ? WHERE id = ?',
      [method_id, sessionId]
    );

    // TODO: 인증번호 방식인 경우 verification_code 저장

    // 해당 강의를 수강하는 학생들에게 알림
    const [course] = await db.query(
      'SELECT course_id FROM class_sessions WHERE id = ?',
      [sessionId]
    );

    if (course.length > 0) {
      const [students] = await db.query(
        `SELECT student_id FROM enrollments 
         WHERE course_id = ? AND status = 'enrolled'`,
        [course[0].course_id]
      );

      // 알림 생성
      for (const student of students) {
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, related_session_id)
           VALUES (?, 'attendance_open', '출석 시작', '출석이 시작되었습니다.', ?)`,
          [student.student_id, sessionId]
        );
      }
    }

    res.json({
      success: true,
      message: '출석이 시작되었습니다.'
    });

  } catch (error) {
    console.error('Open attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 시작 중 오류가 발생했습니다.'
    });
  }
});

// 출석 마감 (교원)
router.post('/:session_id/attendance/close', authorize('instructor'), async (req, res) => {
  try {
    const sessionId = req.params.session_id;

    // 미체크 학생들을 결석 처리
    await db.query(
      `UPDATE attendances 
       SET status_code = 3 
       WHERE session_id = ? AND status_code = 0`,
      [sessionId]
    );

    // 결석 2회 이상 학생에게 경고 알림
    const [course] = await db.query(
      'SELECT course_id FROM class_sessions WHERE id = ?',
      [sessionId]
    );

    if (course.length > 0) {
      const [absentStudents] = await db.query(
        `SELECT a.student_id, COUNT(*) as absent_count
         FROM attendances a
         JOIN class_sessions cs ON a.session_id = cs.id
         WHERE cs.course_id = ? AND a.status_code = 3
         GROUP BY a.student_id
         HAVING absent_count >= 2`,
        [course[0].course_id]
      );

      for (const student of absentStudents) {
        const warningLevel = student.absent_count >= 3 ? '위험' : '경고';
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, related_course_id)
           VALUES (?, 'absence_warning', '결석 ${warningLevel}', 
                   '결석 ${student.absent_count}회입니다. 주의하세요!', ?)`,
          [student.student_id, course[0].course_id]
        );
      }
    }

    res.json({
      success: true,
      message: '출석이 마감되었습니다.'
    });

  } catch (error) {
    console.error('Close attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 마감 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;