import { parseVoiceInput } from '../services/voiceParser.js';

/**
 * @desc    Parse spoken text or voice command into structured transaction data
 * @route   POST /api/voice/parse
 * @access  Private
 */
export const parseVoice = async (req, res, next) => {
  try {
    const { text, language } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        isAmbiguous: true,
        message: 'No voice text provided. Please speak clearly into the microphone.',
      });
    }

    const result = parseVoiceInput(text);

    // Provide friendly confirmation message in user's language
    let confirmationPrompt = '';
    const lang = language || req.user?.preferredLanguage || 'hi';

    if (!result.isAmbiguous && result.data) {
      const amt = result.data.amount;
      const cat = result.data.categoryName || result.data.category;
      const isExp = result.data.type === 'expense';

      if (lang === 'hi') {
        confirmationPrompt = isExp
          ? `${cat} के लिए ₹${amt} का खर्च जोड़ें?`
          : `${cat} से ₹${amt} की आमदनी जोड़ें?`;
      } else if (lang === 'pa') {
        confirmationPrompt = isExp
          ? `${cat} ਲਈ ₹${amt} ਦਾ ਖਰਚਾ ਜੋੜੋ?`
          : `${cat} ਤੋਂ ₹${amt} ਦੀ ਕਮਾਈ ਜੋੜੋ?`;
      } else {
        confirmationPrompt = isExp
          ? `Add expense of ₹${amt} for ${cat}?`
          : `Add income of ₹${amt} for ${cat}?`;
      }
    } else {
      if (lang === 'hi') {
        confirmationPrompt = 'रुपये की रकम स्पष्ट नहीं है। कृपया दोबारा बोलें (जैसे: 200 रुपये सब्ज़ी)।';
      } else if (lang === 'pa') {
        confirmationPrompt = 'ਰੁਪਏ ਦੀ ਰਕਮ ਸਾਫ਼ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ (ਜਿਵੇਂ: 200 ਰੁਪਏ ਸਬਜ਼ੀ)।';
      } else {
        confirmationPrompt = 'Amount could not be detected. Please say something like: 200 rupees for groceries.';
      }
    }

    res.status(200).json({
      success: true,
      result: {
        ...result,
        confirmationPrompt,
      },
    });
  } catch (err) {
    next(err);
  }
};

