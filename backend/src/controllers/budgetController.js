import { Budget } from '../models/Budget.js';
import { Transaction } from '../models/Transaction.js';

/**
 * @desc    Get or create monthly budget with real-time spending progress
 * @route   GET /api/budgets
 * @access  Private
 */
export const getBudget = async (req, res, next) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"
    const month = req.query.month || currentMonth;

    let budget = await Budget.findOne({ user: req.user._id, month });

    // Calculate total spent in this month
    const [year, m] = month.split('-').map(Number);
    const start = new Date(year, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, m, 0, 23, 59, 59, 999);

    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = expenseAgg.length > 0 ? expenseAgg[0].totalSpent : 0;
    const totalBudget = budget ? budget.totalBudget : 0;
    const remaining = Math.max(0, totalBudget - totalSpent);
    const percentageUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

    res.status(200).json({
      success: true,
      data: {
        budget: budget || null,
        month,
        totalBudget,
        totalSpent,
        remaining,
        percentageUsed,
        isOverBudget: totalBudget > 0 && totalSpent > totalBudget,
        overBudgetAmount: totalSpent > totalBudget ? totalSpent - totalBudget : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Set or upsert budget for a month
 * @route   POST /api/budgets
 * @access  Private
 */
export const setBudget = async (req, res, next) => {
  try {
    const { month, totalBudget, categoryBudgets } = req.body;

    if (!totalBudget && totalBudget !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Total budget amount is required.',
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const targetMonth = month || currentMonth;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month: targetMonth },
      {
        user: req.user._id,
        month: targetMonth,
        totalBudget: Number(totalBudget),
        categoryBudgets: categoryBudgets || [],
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update budget by ID
 * @route   PATCH /api/budgets/:id
 * @access  Private
 */
export const updateBudget = async (req, res, next) => {
  try {
    const { totalBudget, categoryBudgets } = req.body;
    const updates = {};
    if (totalBudget !== undefined) updates.totalBudget = Number(totalBudget);
    if (categoryBudgets !== undefined) updates.categoryBudgets = categoryBudgets;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (err) {
    next(err);
  }
};

