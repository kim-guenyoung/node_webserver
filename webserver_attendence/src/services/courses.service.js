import { pool } from '../config/db.js';

export async function getCourses() {
  const [rows] = await pool.query('SELECT * FROM courses');
  return rows;
}

export async function getCourseById(id) {
  const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
  return rows[0];
}

export async function createCourse(body) {
  const { title, code, departmentId, semesterId, instructorId, grade } = body;

  const [result] = await pool.query(
    `INSERT INTO courses (title, code, department_id, semester_id, instructor_id, grade)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, code, departmentId, semesterId, instructorId, grade]
  );
  return { id: result.insertId };
}

export async function updateCourse(id, body) {
  await pool.query('UPDATE courses SET ? WHERE id = ?', [body, id]);
  return { id };
}

export async function deleteCourse(id) {
  await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  return { id };
}
