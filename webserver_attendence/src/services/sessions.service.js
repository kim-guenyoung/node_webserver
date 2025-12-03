import { pool } from '../config/db.js';

export async function getSessionsByCourse(courseId) {
  const [rows] = await pool.query(
    'SELECT * FROM class_sessions WHERE course_id = ?',
    [courseId]
  );
  return rows;
}

export async function createSession(courseId, body) {
  const { week, date, startTime, endTime, room, attendanceMethodId } = body;
  const [result] = await pool.query(
    `INSERT INTO class_sessions
     (course_id, week, date, start_time, end_time, room, attendance_method_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [courseId, week, date, startTime, endTime, room, attendanceMethodId]
  );
  return { id: result.insertId };
}

export async function updateSession(sessionId, body) {
  await pool.query('UPDATE class_sessions SET ? WHERE id = ?', [body, sessionId]);
  return { id: sessionId };
}

export async function deleteSession(sessionId) {
  await pool.query('DELETE FROM class_sessions WHERE id = ?', [sessionId]);
  return { id: sessionId };
}
