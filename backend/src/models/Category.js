import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'Category key is required'],
      trim: true,
      lowercase: true,
    },
    translations: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' },
      pa: { type: String, default: '' },
    },
    type: {
      type: String,
      enum: ['expense', 'income', 'both'],
      default: 'expense',
    },
    icon: {
      type: String,
      default: 'ShoppingBag',
    },
    color: {
      type: String,
      default: '#10B981',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system defaults
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ user: 1, key: 1 });

export const Category = mongoose.model('Category', categorySchema);

