import express from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  syncTransactions,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.post('/sync', syncTransactions);
router.get('/:id', getTransactionById);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;

