const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// 모든 라우트에 인증 필요
router.use(authenticate);

// 출석 방식 목록
router.get('/methods', async (req, res) => {
  try {
    const [methods] = await db.query('SELECT * FROM attendance_methods');
    res.json({ success: true, methods });
  } catch (error) {
    console.error('Get attendance methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 방식 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 출석 상태 코드 목록
router.get('/status-codes', async (req, res) => {
  try {
    const [codes] = await db.query('SELECT * FROM attendance_status_codes');
    res.json({ success: true, codes });
  } catch (error) {
    console.error('Get status codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 상태 코드를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 출석 체크 (학생)
router.post('/check', authorize('student'), async (req, res) => {
  try {
    const { session_id, verification_code } = req.body;
    const studentId = req.user.id;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '세션 ID가 필요합니다.'
      });
    }

    // 세션 정보 확인
    const [sessions] = await db.query(
      'SELECT * FROM class_sessions WHERE id = ?',
      [session_id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '강의 세션을 찾을 수 없습니다.'
      });
    }

    // 인증번호 방식인 경우 검증 (실제로는 세션에 저장된 코드와 비교)
    // TODO: 인증번호 검증 로직 추가

    // 출석 체크
    const [result] = await db.query(
      `UPDATE attendances 
       SET status_code = 1, checked_at = NOW(), method_id = ?
       WHERE session_id = ? AND student_id = ?`,
      [1, session_id, studentId] // 임시로 method_id = 1 (전자출결)
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '출석 레코드를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '출석 체크가 완료되었습니다.'
    });

  } catch (error) {
    console.error('Check attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 체크 중 오류가 발생했습니다.'
    });
  }
});

// 출석 상태 수정 (교원 - 정정)
router.put('/:id', authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { status_code, reason } = req.body;

    if (status_code === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '출석 상태 코드가 필요합니다.'
      });
    }

    // 기존 출석 정보 조회 (감사 로그용)
    const [beforeData] = await db.query(
      'SELECT * FROM attendances WHERE id = ?',
      [req.params.id]
    );

    if (beforeData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '출석 기록을 찾을 수 없습니다.'
      });
    }

    // 출석 상태 업데이트
    await db.query(
      `UPDATE attendances 
       SET status_code = ?, is_changed = 1, instructor_id = ?
       WHERE id = ?`,
      [status_code, req.user.id, req.params.id]
    );

    // 감사 로그 기록
    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_type, target_id, before_value, after_value, ip_address)
       VALUES (?, 'attendance_changed', 'attendance', ?, ?, ?, ?)`,
      [
        req.user.id,
        req.params.id,
        JSON.stringify({ status_code: beforeData[0].status_code }),
        JSON.stringify({ status_code, reason }),
        req.ip
      ]
    );

    res.json({
      success: true,
      message: '출석 상태가 변경되었습니다.'
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

// 학생의 전체 출석 현황 조회
router.get('/students/:student_id', async (req, res) => {
  try {
    const { course_id } = req.query;
    const studentId = req.params.student_id;

    // 권한 체크: 본인 또는 교원/관리자만
    if (req.user.role === 'student' && req.user.id != studentId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: '권한이 없습니다.'
      });
    }

    let query = `
      SELECT 
        a.*,
        cs.week, cs.date, cs.start_time, cs.end_time,
        c.title as course_title, c.code as course_code,
        asc.name as status_name
      FROM attendances a
      JOIN class_sessions cs ON a.session_id = cs.id
      JOIN courses c ON cs.course_id = c.id
      JOIN attendance_status_codes asc ON a.status_code = asc.code
      WHERE a.student_id = ?
    `;
    
    const params = [studentId];

    if (course_id) {
      query += ' AND cs.course_id = ?';
      params.push(course_id);
    }

    query += ' ORDER BY cs.date DESC';

    const [attendances] = await db.query(query, params);

    // 통계 계산
    const statistics = {
      total_sessions: attendances.length,
      present: attendances.filter(a => a.status_code === 1).length,
      late: attendances.filter(a => a.status_code === 2).length,
      absent: attendances.filter(a => a.status_code === 3).length,
      excused: attendances.filter(a => a.status_code === 4).length,
      pending: attendances.filter(a => a.status_code === 0).length
    };

    statistics.absence_rate = statistics.total_sessions > 0 
      ? ((statistics.absent / statistics.total_sessions) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      attendances,
      statistics
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '출석 현황을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;