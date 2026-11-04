import { User } from '../models/User.js';
import { sendTokenResponse } from '../utils/token.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, identifier, password, preferredLanguage } = req.body;

    if (!name || !identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone/email identifier, and password.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const existing = await User.findOne({ identifier: cleanIdentifier });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this phone number or email already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      identifier: cleanIdentifier,
      password,
      preferredLanguage: preferredLanguage || 'hi',
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone/email and password.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({ identifier: cleanIdentifier });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Wrong password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Log out user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Update user preferences (language, voice speed, etc.)
 * @route   PATCH /api/auth/me
 * @access  Private
 */
export const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'preferredLanguage', 'currency', 'currencySymbol', 'voiceSpeed', 'autoPlaySpeech'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

