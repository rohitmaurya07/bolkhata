import express from 'express';
import { parseVoice } from '../controllers/voiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/parse', parseVoice);

export default router;

