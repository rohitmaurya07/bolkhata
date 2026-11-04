import { Transaction } from '../models/Transaction.js';
import { generateSummarySpeech } from '../services/ttsService.js';

// Helper to calculate date range based on period query
export function getDateRange(period, customStart, customEnd) {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'yesterday') {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'week') {
    // Current week starting Monday
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'custom' && customStart && !customEnd) {
    start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    end = new Date(customStart);
    end.setHours(23, 59, 59, 999);
  } else {
    // Default: all or wide range
    start = new Date(0);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

/**
 * @desc    Create new transaction (single or batch)
 * @route   POST /api/transactions
 * @access  Private
 */
export const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      category,
      categoryName,
      categoryIcon,
      description,
      date,
      paymentMethod,
      status,
      source,
      rawVoiceText,
      offlineId
    } = req.body;

    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type and amount are required.',
      });
    }

    // Check if duplicate offline transaction already synced
    if (offlineId) {
      const existing = await Transaction.findOne({ user: req.user._id, offlineId });
      if (existing) {
        return res.status(200).json({
          success: true,
          data: existing,
          synced: true,
        });
      }
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: Number(amount),
      category: category || 'other',
      categoryName: categoryName || category || 'Other',
      categoryIcon: categoryIcon || 'Wallet',
      description: description || '',
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'cash',
      status: status || 'completed',
      source: source || 'manual',
      rawVoiceText: rawVoiceText || '',
      offlineId: offlineId || null,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all transactions with filtering and pagination
 * @route   GET /api/transactions
 * @access  Private
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { period, type, category, startDate, endDate, limit = 50, page = 1, search } = req.query;

    const query = { user: req.user._id };

    if (period && period !== 'all') {
      const { start, end } = getDateRange(period, startDate, endDate);
      query.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    } else if (startDate) {
      query.date = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(startDate).setHours(23, 59, 59, 999))
      };
    }

    if (type && (type === 'expense' || type === 'income')) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
        { rawVoiceText: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get summary (today, yesterday, week, month) + audio speech summary
 * @route   GET /api/transactions/summary
 * @access  Private
 */
export const getTransactionSummary = async (req, res, next) => {
  try {
    const { period = 'today', language, startDate, endDate } = req.query;
    const { start, end } = getDateRange(period, startDate, endDate);

    const userLang = language || req.user.preferredLanguage || 'hi';

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    }).lean();

    let totalExpense = 0;
    let totalIncome = 0;
    const categoryTotals = {};

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'expense') {
        totalExpense += amt;
        const catKey = t.category || 'other';
        const catName = t.categoryName || t.category || 'Other';
        if (!categoryTotals[catKey]) {
          categoryTotals[catKey] = {
            category: catKey,
            name: catName,
            icon: t.categoryIcon || 'ShoppingBag',
            amount: 0,
            count: 0
          };
        }
        categoryTotals[catKey].amount += amt;
        categoryTotals[catKey].count += 1;
      } else if (t.type === 'income') {
        totalIncome += amt;
      }
    });

    const netBalance = totalIncome - totalExpense;

    // Determine top spending category
    const categoryBreakdown = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    // Generate speech summary text
    const speechSummary = generateSummarySpeech({
      period,
      totalExpense,
      totalIncome,
      netBalance,
      topCategory,
      transactionCount: transactions.length,
      language: userLang,
      currencySymbol: req.user.currencySymbol || '₹',
    });

    res.status(200).json({
      success: true,
      period,
      range: { start, end },
      totalExpense,
      totalIncome,
      netBalance,
      transactionCount: transactions.length,
      categoryBreakdown,
      topCategory,
      speechSummary,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update transaction
 * @route   PATCH /api/transactions/:id
 * @access  Private
 */
export const updateTransaction = async (req, res, next) => {
  try {
    const allowed = [
      'type', 'amount', 'category', 'categoryName', 'categoryIcon',
      'description', 'date', 'paymentMethod', 'status'
    ];

    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Batch sync transactions from offline IndexedDB queue
 * @route   POST /api/transactions/sync
 * @access  Private
 */
export const syncTransactions = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ success: true, count: 0, items: [] });
    }

    const synced = [];
    for (const item of items) {
      if (!item.amount || !item.type) continue;

      let existing = null;
      if (item.offlineId) {
        existing = await Transaction.findOne({ user: req.user._id, offlineId: item.offlineId });
      }

      if (existing) {
        synced.push(existing);
      } else {
        const created = await Transaction.create({
          user: req.user._id,
          type: item.type,
          amount: Number(item.amount),
          category: item.category || 'other',
          categoryName: item.categoryName || 'Other',
          categoryIcon: item.categoryIcon || 'Wallet',
          description: item.description || '',
          date: item.date ? new Date(item.date) : new Date(),
          paymentMethod: item.paymentMethod || 'cash',
          status: item.status || 'completed',
          source: item.source || 'voice',
          rawVoiceText: item.rawVoiceText || '',
          offlineId: item.offlineId || null,
        });
        synced.push(created);
      }
    }

    res.status(200).json({
      success: true,
      count: synced.length,
      items: synced,
    });
  } catch (err) {
    next(err);
  }
};

