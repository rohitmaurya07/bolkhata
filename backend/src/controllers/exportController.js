import { Transaction } from '../models/Transaction.js';
import { generateCSV, generatePDF } from '../services/exportService.js';
import { getDateRange } from './transactionController.js';

/**
 * @desc    Export transactions as CSV
 * @route   GET /api/export/csv
 * @access  Private
 */
export const exportCSV = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (period) {
      const { start, end } = getDateRange(period, startDate, endDate);
      query.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();
    const csvData = generateCSV(transactions, req.user);

    const filename = `bolkhata-transactions-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Export transactions as PDF Statement
 * @route   GET /api/export/pdf
 * @access  Private
 */
export const exportPDF = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (period) {
      const { start, end } = getDateRange(period, startDate, endDate);
      query.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

    let totalExpense = 0;
    let totalIncome = 0;
    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'expense') totalExpense += amt;
      else if (t.type === 'income') totalIncome += amt;
    });

    const pdfBuffer = await generatePDF(transactions, req.user, { totalExpense, totalIncome });
    const filename = `bolkhata-statement-${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

