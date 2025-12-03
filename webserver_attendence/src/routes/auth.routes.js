import express from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', auth, me);

export default router;
