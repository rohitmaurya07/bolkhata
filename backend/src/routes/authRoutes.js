import express from 'express';
import { register, login, logout, getMe, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

export default router;

