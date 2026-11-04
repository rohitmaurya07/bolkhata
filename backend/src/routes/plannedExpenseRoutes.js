import express from 'express';
import {
  createPlannedExpense,
  getPlannedExpenses,
  updatePlannedExpense,
  deletePlannedExpense,
} from '../controllers/plannedExpenseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createPlannedExpense);
router.get('/', getPlannedExpenses);
router.patch('/:id', updatePlannedExpense);
router.delete('/:id', deletePlannedExpense);

export default router;

