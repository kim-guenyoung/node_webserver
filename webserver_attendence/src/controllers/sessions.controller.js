import {
  getSessionsByCourse,
  createSession,
  updateSession,
  deleteSession,
} from '../services/sessions.service.js';

// 과목별 세션 목록 조회
export async function listByCourse(req, res) {
  try {
    const data = await getSessionsByCourse(req.params.courseId);
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
}

// 세션 생성
export async function create(req, res) {
  try {
    const result = await createSession(req.params.courseId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
}

// 세션 수정
export async function update(req, res) {
  try {
    const result = await updateSession(req.params.sessionId, req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
}

// 세션 삭제
export async function remove(req, res) {
  try {
    const result = await deleteSession(req.params.sessionId);
    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
}
