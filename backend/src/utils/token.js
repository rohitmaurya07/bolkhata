import jwt from 'jsonwebtoken';

export const sendTokenResponse = (user, statusCode, res) => {
  const secret = process.env.JWT_SECRET || 'bolkhata-jwt-super-secret-key-2026';
  const token = jwt.sign({ id: user._id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token, // Provided in body so PWA / offline clients can also keep it in IndexedDB/localStorage
    user: {
      _id: user._id,
      name: user.name,
      identifier: user.identifier,
      preferredLanguage: user.preferredLanguage,
      currency: user.currency,
      currencySymbol: user.currencySymbol,
      voiceSpeed: user.voiceSpeed,
      autoPlaySpeech: user.autoPlaySpeech,
    },
  });
};

