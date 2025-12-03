import {
  getSessionsByCourse,
  createSession,
  updateSession,
  deleteSession,
} from '../services/sessions.service.js';

export async function listByCourse(req, res) {
  const data = await getSessionsByCourse(req.params.courseId);
  res.json({ success: true, data });
}

export async function create(req, res) {
  const result = await createSession(req.params.courseId, req.body);
  res.status(201).json({ success: true, data: result });
}

export async function update(req, res) {
  const result = await updateSession(req.params.sessionId, req.body);
  res.json({ success: true, data: result });
}

export async function remove(req, res) {
  const result = await deleteSession(req.params.sessionId);
  res.json({ success: true, data: result });
}
