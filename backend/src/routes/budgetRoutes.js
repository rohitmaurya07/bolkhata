import express from 'express';
import { getBudget, setBudget, updateBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getBudget);
router.post('/', setBudget);
router.patch('/:id', updateBudget);

export default router;

