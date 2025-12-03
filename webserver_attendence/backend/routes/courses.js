const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// 모든 라우트에 인증 필요
router.use(authenticate);

// 과목 목록 조회
router.get('/', async (req, res) => {
  try {
    const { semester_id, department_id, instructor_id, student_id, grade } = req.query;
    
    let query = `
      SELECT 
        c.*,
        d.name as department_name,
        s.year, s.term,
        u.name as instructor_name
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      JOIN semesters s ON c.semester_id = s.id
      JOIN users u ON c.instructor_id = u.id
      WHERE c.is_active = 1
    `;
    
    const params = [];

    if (semester_id) {
      query += ' AND c.semester_id = ?';
      params.push(semester_id);
    }

    if (department_id) {
      query += ' AND c.department_id = ?';
      params.push(department_id);
    }

    if (instructor_id) {
      query += ' AND c.instructor_id = ?';
      params.push(instructor_id);
    }

    if (grade) {
      query += ' AND c.grade = ?';
      params.push(grade);
    }

    // 학생인 경우 본인이 수강하는 과목만
    if (student_id && req.user.role === 'student') {
      query = `
        SELECT 
          c.*,
          d.name as department_name,
          s.year, s.term,
          u.name as instructor_name
        FROM courses c
        JOIN departments d ON c.department_id = d.id
        JOIN semesters s ON c.semester_id = s.id
        JOIN users u ON c.instructor_id = u.id
        JOIN enrollments e ON c.id = e.course_id
        WHERE c.is_active = 1 AND e.student_id = ? AND e.status = 'enrolled'
      `;
      params.unshift(student_id);
    }

    query += ' ORDER BY c.created_at DESC';

    const [courses] = await db.query(query, params);

    res.json({
      success: true,
      courses
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '과목 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 과목 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const [courses] = await db.query(
      `SELECT 
        c.*,
        d.name as department_name,
        s.year, s.term,
        u.name as instructor_name,
        u.email as instructor_email
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      JOIN semesters s ON c.semester_id = s.id
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?`,
      [req.params.id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '과목을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      course: courses[0]
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '과목 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 과목 생성 (Admin, Instructor)
router.post('/', authorize('admin', 'instructor'), async (req, res) => {
  try {
    const { title, code, department_id, semester_id, instructor_id, grade } = req.body;

    // 입력 검증
    if (!title || !code || !department_id || !semester_id || !instructor_id || !grade) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '필수 항목을 모두 입력해주세요.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO courses (title, code, department_id, semester_id, instructor_id, grade)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, code, department_id, semester_id, instructor_id, grade]
    );

    res.status(201).json({
      success: true,
      message: '과목이 생성되었습니다.',
      courseId: result.insertId
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '과목 생성 중 오류가 발생했습니다.'
    });
  }
});

// 과목 수정 (Admin, Instructor)
router.put('/:id', authorize('admin', 'instructor'), async (req, res) => {
  try {
    const { title, code, department_id, semester_id, instructor_id, grade, is_active } = req.body;

    const [result] = await db.query(
      `UPDATE courses 
       SET title = ?, code = ?, department_id = ?, semester_id = ?, 
           instructor_id = ?, grade = ?, is_active = ?
       WHERE id = ?`,
      [title, code, department_id, semester_id, instructor_id, grade, is_active, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '과목을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '과목이 수정되었습니다.'
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '과목 수정 중 오류가 발생했습니다.'
    });
  }
});

// 과목 삭제 (Admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM courses WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: '과목을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '과목이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '과목 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;