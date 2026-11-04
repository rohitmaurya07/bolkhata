import mongoose from 'mongoose';

const categoryBudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: String, // Format: YYYY-MM e.g. "2026-11"
      required: [true, 'Month format YYYY-MM is required'],
      match: [/^\d{4}-\d{2}$/, 'Please use YYYY-MM format'],
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget amount is required'],
      min: [0, 'Budget cannot be negative'],
    },
    categoryBudgets: [categoryBudgetSchema],
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

export const Budget = mongoose.model('Budget', budgetSchema);

