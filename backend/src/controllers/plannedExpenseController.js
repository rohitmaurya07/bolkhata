import { PlannedExpense } from '../models/PlannedExpense.js';
import { Transaction } from '../models/Transaction.js';

/**
 * @desc    Create a planned expense / upcoming bill
 * @route   POST /api/planned-expenses
 * @access  Private
 */
export const createPlannedExpense = async (req, res, next) => {
  try {
    const { title, amount, category, dueDate, paymentMethod, notes } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, and due date are required.',
      });
    }

    const planned = await PlannedExpense.create({
      user: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      category: category || 'bills',
      dueDate: new Date(dueDate),
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: planned,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get planned expenses with optional status filter
 * @route   GET /api/planned-expenses
 * @access  Private
 */
export const getPlannedExpenses = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const list = await PlannedExpense.find(query)
      .sort({ dueDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update planned expense (including mark as paid)
 * @route   PATCH /api/planned-expenses/:id
 * @access  Private
 */
export const updatePlannedExpense = async (req, res, next) => {
  try {
    const planned = await PlannedExpense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!planned) {
      return res.status(404).json({
        success: false,
        message: 'Planned expense not found or unauthorized.',
      });
    }

    const { title, amount, category, dueDate, status, paymentMethod, notes, createTransactionOnPaid } = req.body;

    if (title !== undefined) planned.title = title;
    if (amount !== undefined) planned.amount = Number(amount);
    if (category !== undefined) planned.category = category;
    if (dueDate !== undefined) planned.dueDate = new Date(dueDate);
    if (paymentMethod !== undefined) planned.paymentMethod = paymentMethod;
    if (notes !== undefined) planned.notes = notes;

    // If status is transitioning to paid and createTransactionOnPaid is requested
    if (status && status !== planned.status) {
      planned.status = status;
      if (status === 'paid' && createTransactionOnPaid !== false && !planned.paidTransactionId) {
        const txn = await Transaction.create({
          user: req.user._id,
          type: 'expense',
          amount: planned.amount,
          category: planned.category,
          categoryName: planned.title,
          categoryIcon: 'Zap',
          description: `Paid bill: ${planned.title}`,
          date: new Date(),
          paymentMethod: planned.paymentMethod || 'cash',
          status: 'completed',
          source: 'planned',
        });
        planned.paidTransactionId = txn._id;
      }
    }

    await planned.save();

    res.status(200).json({
      success: true,
      data: planned,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete planned expense
 * @route   DELETE /api/planned-expenses/:id
 * @access  Private
 */
export const deletePlannedExpense = async (req, res, next) => {
  try {
    const planned = await PlannedExpense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!planned) {
      return res.status(404).json({
        success: false,
        message: 'Planned expense not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: planned,
      message: 'Planned expense deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

