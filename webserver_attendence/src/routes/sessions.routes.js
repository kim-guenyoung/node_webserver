import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  listByCourse,
  create,
  update,
  remove,
} from '../controllers/sessions.controller.js';

const router = express.Router();

router.get('/course/:courseId', auth, listByCourse);
router.post('/course/:courseId', auth, create);
router.put('/:sessionId', auth, update);
router.delete('/:sessionId', auth, remove);

export default router;
