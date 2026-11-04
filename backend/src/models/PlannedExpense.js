import mongoose from 'mongoose';

const plannedExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      default: 'bills',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank', 'card', 'other'],
      default: 'cash',
    },
    notes: {
      type: String,
      default: '',
    },
    paidTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

plannedExpenseSchema.index({ user: 1, dueDate: 1 });
plannedExpenseSchema.index({ user: 1, status: 1 });

export const PlannedExpense = mongoose.model('PlannedExpense', plannedExpenseSchema);

