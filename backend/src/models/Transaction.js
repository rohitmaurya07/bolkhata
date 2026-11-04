import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: [true, 'Transaction type is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'other',
      index: true,
    },
    categoryName: {
      type: String,
      default: '',
    },
    categoryIcon: {
      type: String,
      default: 'Wallet',
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 200,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank', 'card', 'other'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'completed',
    },
    source: {
      type: String,
      enum: ['voice', 'manual', 'planned'],
      default: 'manual',
    },
    rawVoiceText: {
      type: String,
      default: '',
    },
    offlineId: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);

