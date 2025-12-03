import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  list,
  detail,
  create,
  update,
  remove,
} from '../controllers/courses.controller.js';

const router = express.Router();

router.get('/', auth, list);
router.get('/:id', auth, detail);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

export default router;
