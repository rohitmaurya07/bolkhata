import { Category } from '../models/Category.js';
import { CATEGORY_DEFINITIONS } from '../services/voiceParser.js';

/**
 * Seed default categories if none exist in the database
 */
export async function ensureDefaultCategories() {
  const count = await Category.countDocuments({ user: null });
  if (count === 0) {
    const docs = CATEGORY_DEFINITIONS.map(c => ({
      name: c.name,
      key: c.key,
      translations: {
        en: c.name,
        hi: c.name,
        pa: c.name,
      },
      type: c.type,
      icon: c.icon,
      color: c.color,
      isDefault: true,
      user: null,
    }));
    await Category.insertMany(docs);
  }
}

/**
 * @desc    Get all categories (defaults + user custom)
 * @route   GET /api/categories
 * @access  Private
 */
export const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    const query = {
      $or: [{ user: null }, { user: req.user._id }],
    };

    if (type) {
      query.type = { $in: [type, 'both'] };
    }

    const categories = await Category.find(query).sort({ isDefault: -1, createdAt: 1 }).lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create custom category
 * @route   POST /api/categories
 * @access  Private
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, type = 'expense', icon = 'Tag', color = '#10B981' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const category = await Category.create({
      name: name.trim(),
      key,
      type,
      icon,
      color,
      isDefault: false,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

