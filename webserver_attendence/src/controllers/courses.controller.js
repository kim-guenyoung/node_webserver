import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../services/courses.service.js';

export async function list(req, res) {
  const data = await getCourses();
  res.json({ success: true, data });
}

export async function detail(req, res) {
  const data = await getCourseById(req.params.id);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  res.json({ success: true, data });
}

export async function create(req, res) {
  const result = await createCourse(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function update(req, res) {
  const result = await updateCourse(req.params.id, req.body);
  res.json({ success: true, data: result });
}

export async function remove(req, res) {
  const result = await deleteCourse(req.params.id);
  res.json({ success: true, data: result });
}
