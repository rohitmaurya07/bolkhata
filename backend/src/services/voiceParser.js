/**
 * Multilingual Voice Command Parser for BolKhata
 * Supports: Hindi (Devanagari + Hinglish Romanized), Punjabi (Gurmukhi + Romanized), English.
 */

// Category dictionary with multilingual aliases
export const CATEGORY_DEFINITIONS = [
  {
    key: 'groceries',
    name: 'Groceries & Sabzi',
    icon: 'ShoppingBag',
    color: '#10B981',
    type: 'expense',
    keywords: [
      'sabzi', 'sabji', 'tarkari', 'bhaji', 'vegetable', 'vegetables', 'kirana', 'rashan',
      'ration', 'grocery', 'groceries', 'doodh', 'milk', 'paneer', 'curd', 'dahi', 'atta',
      'chawal', 'rice', 'dal', 'daal', 'oil', 'tel', 'fruits', 'fal', 'fruit', 'seb', 'kela',
      'tamatar', 'pyaz', 'aloo', 'aloo pyaz', 'saag', 'dudh', 'machhi', 'fish', 'meat',
      'chicken', 'ande', 'eggs', 'egg', 'mutton', 'bread', 'butter', 'makhan'
    ]
  },
  {
    key: 'travel',
    name: 'Petrol & Travel',
    icon: 'Fuel',
    color: '#F59E0B',
    type: 'expense',
    keywords: [
      'petrol', 'diesel', 'cng', 'fuel', 'tel dalwaya', 'travel', 'bus', 'train', 'metro',
      'auto', 'rickshaw', 'cab', 'taxi', 'uber', 'ola', 'rapido', 'ticket', 'fare', 'kiraya',
      'toll', 'parking', 'gaadi', 'bike', 'scooter', 'puncture', 'service'
    ]
  },
  {
    key: 'food',
    name: 'Food & Chai',
    icon: 'Utensils',
    color: '#EF4444',
    type: 'expense',
    keywords: [
      'chai', 'tea', 'coffee', 'nashta', 'breakfast', 'lunch', 'dinner', 'khana', 'restaurant',
      'hotel', 'dhaba', 'samosa', 'mithai', 'sweets', 'swiggy', 'zomato', 'snack', 'snacks',
      'burger', 'pizza', 'roti', 'paratha', 'biscuit', 'pani puri', 'chaat'
    ]
  },
  {
    key: 'bills',
    name: 'Bills & Recharge',
    icon: 'Zap',
    color: '#8B5CF6',
    type: 'expense',
    keywords: [
      'bill', 'bijli', 'electricity', 'light bill', 'water', 'pani', 'paani', 'cylinder',
      'gas', 'lpg', 'wifi', 'broadband', 'internet', 'recharge', 'mobile', 'phone recharge',
      'dth', 'tv', 'cable', 'rent', 'room rent', 'kiraya', 'makan kiraya', 'maintenance',
      'emi', 'kisht', 'kist', 'loan', 'insurance', 'tax'
    ]
  },
  {
    key: 'health',
    name: 'Health & Medicine',
    icon: 'HeartPulse',
    color: '#EC4899',
    type: 'expense',
    keywords: [
      'dawa', 'dawai', 'dawakhana', 'medicine', 'medicines', 'doctor', 'hospital', 'clinic',
      'checkup', 'test', 'blood test', 'medical', 'pharma', 'tablet', 'syrup', 'bandage',
      'operation', 'fee', 'dr'
    ]
  },
  {
    key: 'shopping',
    name: 'Clothing & Shopping',
    icon: 'ShoppingBag',
    color: '#3B82F6',
    type: 'expense',
    keywords: [
      'kapde', 'clothes', 'clothing', 'shopping', 'shoes', 'chappal', 'bag', 'joota',
      'suit', 'saree', 'shirt', 'pant', 'jeans', 'mall', 'bazaar', 'market', 'amazon', 'flipkart'
    ]
  },
  {
    key: 'salary',
    name: 'Salary & Wage',
    icon: 'Briefcase',
    color: '#059669',
    type: 'income',
    keywords: [
      'salary', 'tankhwah', 'vetan', 'dihadi', 'wage', 'wages', 'pension', 'paycheck',
      'kamai', 'pagar', 'tanha'
    ]
  },
  {
    key: 'business',
    name: 'Business & Sale',
    icon: 'Store',
    color: '#10B981',
    type: 'income',
    keywords: [
      'dukan', 'shop', 'sale', 'sales', 'bikri', 'customer', 'grahak', 'profit', 'munafa',
      'business', 'kamai', 'client', 'payment aayi', 'bheja', 'payment mil gaya', 'commission'
    ]
  },
  {
    key: 'other',
    name: 'Other',
    icon: 'Wallet',
    color: '#6B7280',
    type: 'both',
    keywords: ['other', 'kuchh', 'extra', 'misc']
  }
];

// Number word mappings (Hindi / Punjabi / English spoken numbers)
const NUMBER_WORDS = {
  // English
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100, 'thousand': 1000, 'lakh': 100000, 'crore': 10000000,

  // Hindi / Punjabi Romanized
  'ek': 1, 'do': 2, 'teen': 3, 'tin': 3, 'chaar': 4, 'char': 4, 'paanch': 5, 'panch': 5,
  'chheh': 6, 'che': 6, 'saat': 7, 'sat': 7, 'aath': 8, 'ath': 8, 'nau': 9, 'das': 10,
  'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15, 'solah': 16,
  'satrah': 17, 'atharah': 18, 'unnis': 19, 'bees': 20, 'vi': 20,
  'pachees': 25, 'tees': 30, 'paintees': 35, 'chaalis': 40, 'chalis': 40,
  'pachaas': 50, 'panjah': 50, 'saath': 60, 'sattar': 70, 'assi': 80, 'nabbe': 90,
  'sau': 100, 'so': 100, 'sai': 100,
  'hazaar': 1000, 'hazar': 1000, 'k': 1000,
  'dedh sau': 150, 'dhai sau': 250, 'sadhe teen sau': 350,
  'dedh hazaar': 1500, 'dhai hazaar': 2500,
  'lakh': 100000, 'lac': 100000,

  // Devanagari numbers
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'सात': 7,
  'आठ': 8, 'नौ': 9, 'दस': 10, 'सौ': 100, 'हजार': 1000, 'हज़ार': 1000, 'लाख': 100000,

  // Gurmukhi numbers
  'ਇੱਕ': 1, 'ਦੋ': 2, 'ਤਿੰਨ': 3, 'ਚਾਰ': 4, 'ਪੰਜ': 5, 'ਛੇ': 6, 'ਸੱਤ': 7, 'ਅੱਠ': 8,
  'ਨੌਂ': 9, 'ਦਸ': 10, 'ਸੌ': 100, 'ਹਜ਼ਾਰ': 1000, 'ਲੱਖ': 100000
};

// Payment Method Keywords
const PAYMENT_METHODS = {
  upi: ['gpay', 'google pay', 'phonepe', 'phone pe', 'paytm', 'bhim', 'upi', 'online', 'scanner', 'scan kiya', 'qr'],
  cash: ['cash', 'roka', 'rokad', 'nagad', 'hath me', 'cash me', 'hatho hath', 'cash ditta'],
  bank: ['bank', 'account', 'transfer', 'neft', 'rtgs', 'imps', 'cheque', 'check', 'khate me'],
  card: ['card', 'debit card', 'credit card', 'atm']
};

/**
 * Extract digits or spoken numbers from text
 */
export function extractAmount(text) {
  const clean = text.toLowerCase();

  // Pattern 1: Direct digits e.g., 200, 200.50, ₹500, rs 500, 5000/-
  const digitRegex = /(?:rs\.?|inr|₹|rupaye|rupees|rupay|roopaye)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:rs\.?|inr|₹|rupaye|rupees|rupay|roopaye|\/-)?/gi;
  
  // Find all matches with digits
  const digitMatches = [...clean.matchAll(/\b(\d+(?:\.\d{1,2})?)\b/g)];
  if (digitMatches.length > 0) {
    // Select the most likely amount (first non-year like number, or closest to currency words)
    for (const match of digitMatches) {
      const val = parseFloat(match[1]);
      // Avoid interpreting year like 2026 as amount unless preceded by currency word
      if (val === 2024 || val === 2025 || val === 2026) {
        if (/₹|rupee|rs|rupaye/.test(clean)) {
          return val;
        }
      } else if (val > 0) {
        return val;
      }
    }
    return parseFloat(digitMatches[0][1]);
  }

  // Pattern 2: Multi-word amounts like "dhai sau", "dedh hazaar", "paanch sau"
  if (clean.includes('dedh sau')) return 150;
  if (clean.includes('dhai sau')) return 250;
  if (clean.includes('dedh hazaar') || clean.includes('dedh hazar')) return 1500;
  if (clean.includes('dhai hazaar') || clean.includes('dhai hazar')) return 2500;

  // Words combined e.g. "do sau" -> 200, "paanch hazaar" -> 5000
  const words = clean.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const nextW = words[i + 1];

    if (NUMBER_WORDS[w] && nextW && (nextW === 'sau' || nextW === 'hundred' || nextW === 'so' || nextW === 'ਸੌ' || nextW === 'सौ')) {
      return NUMBER_WORDS[w] * 100;
    }
    if (NUMBER_WORDS[w] && nextW && (nextW === 'hazaar' || nextW === 'hazar' || nextW === 'thousand' || nextW === 'ਹਜ਼ਾਰ' || nextW === 'हजार')) {
      return NUMBER_WORDS[w] * 1000;
    }
    if (NUMBER_WORDS[w] && nextW && (nextW === 'lakh' || nextW === 'lac' || nextW === 'ਲੱਖ' || nextW === 'लाख')) {
      return NUMBER_WORDS[w] * 100000;
    }
  }

  // Single word numbers e.g., "sau" -> 100, "hazaar" -> 1000
  for (const w of words) {
    if (NUMBER_WORDS[w] && NUMBER_WORDS[w] >= 10) {
      return NUMBER_WORDS[w];
    }
  }

  return null;
}

/**
 * Determine intent: 'transaction' vs 'planned_expense' vs 'query_summary' vs 'query_history'
 */
export function extractIntent(text) {
  const clean = text.toLowerCase();

  // Query summaries
  const querySummaryPatterns = [
    /how much (did i|have i|i) spend/i,
    /kitna kharch(a|i)? hua/i,
    /kini kharch hoi/i,
    /aaj ka kharcha/i,
    /aj da kharcha/i,
    /today('s)? (spending|expense|expenses|summary)/i,
    /show (my )?summary/i,
    /aaj kitne rupaye kharch kiye/i
  ];
  for (const pattern of querySummaryPatterns) {
    if (pattern.test(clean)) {
      return {
        action: 'query_summary',
        period: clean.includes('week') || clean.includes('hafte') ? 'week' :
                clean.includes('month') || clean.includes('mahine') ? 'month' : 'today'
      };
    }
  }

  // Query history
  const queryHistoryPatterns = [
    /show (my )?expenses/i,
    /kharcha dikhao/i,
    /hisab dikhao/i,
    /history dikhao/i,
    /show history/i,
    /last transactions/i
  ];
  for (const pattern of queryHistoryPatterns) {
    if (pattern.test(clean)) {
      return {
        action: 'query_history',
        period: clean.includes('week') || clean.includes('hafte') ? 'week' :
                clean.includes('month') || clean.includes('mahine') ? 'month' : 'all'
      };
    }
  }

  // Planned expense patterns (dena hai, bharna hai, dena hovenga, due tomorrow, reminder, bill pay karna hai)
  const plannedPatterns = [
    /dena hai/i, /dena h/i, /deni hai/i, /bharna hai/i, /bharni hai/i,
    /bill dena hai/i, /kist deni hai/i, /kisht deni hai/i, /emi deni hai/i,
    /dena paina/i, /bharna paina/i, /pay karna hai/i, /to pay/i, /due date/i,
    /reminder/i, /kal dena/i, /parso dena/i
  ];
  for (const pattern of plannedPatterns) {
    if (pattern.test(clean)) {
      return { action: 'planned_expense' };
    }
  }

  // Default to standard transaction entry
  return { action: 'add_transaction' };
}

/**
 * Determine transaction type: 'expense' vs 'income'
 */
export function extractTransactionType(text) {
  const clean = text.toLowerCase();

  // Income triggers
  const incomeKeywords = [
    'received', 'got', 'salary', 'tankhwah', 'vetan', 'dihadi', 'aaye', 'aaya', 'aayi',
    'mila', 'mili', 'mile', 'mil gaya', 'mil gaye', 'kamaye', 'kamaya', 'bikri',
    'payment aayi', 'credit', 'credited', 'dukan ki kamai', 'labh', 'munafa',
    'labhya', 'kamaye han', 'vapas mile', 'refund mila'
  ];

  // Expense triggers
  const expenseKeywords = [
    'spent', 'spend', 'paid', 'kharch', 'kharcha', 'kharch kiye', 'kharcha kiya',
    'diya', 'diye', 'de diya', 'bhara', 'kharida', 'leya', 'le aao', 'khareeda',
    'bought', 'purchase', 'petrol dalwaya', 'bill bhara', 'ditta', 'kharch kitte'
  ];

  for (const word of incomeKeywords) {
    if (clean.includes(word)) return 'income';
  }

  for (const word of expenseKeywords) {
    if (clean.includes(word)) return 'expense';
  }

  // If salary or business words present, default to income
  if (clean.includes('salary') || clean.includes('pension')) return 'income';

  // Default for tracker is expense
  return 'expense';
}

/**
 * Extract Category based on dictionary matches
 */
export function extractCategory(text, type = 'expense') {
  const clean = text.toLowerCase();

  // Sort matching candidates: prefer longer keywords first to prevent short substring hijacking
  // Pass 1: exact word boundary match for type-matched categories
  for (const cat of CATEGORY_DEFINITIONS) {
    if (cat.type !== 'both' && cat.type !== type && cat.key !== 'other') {
      continue;
    }
    const sortedKeywords = [...cat.keywords].sort((a, b) => b.length - a.length);
    for (const kw of sortedKeywords) {
      const regex = new RegExp(`(?:^|\\s|[,.!?;])${kw}(?:$|\\s|[,.!?;])`, 'i');
      if (regex.test(clean)) {
        return cat;
      }
    }
  }

  // Pass 2: check all categories with word boundary
  for (const cat of CATEGORY_DEFINITIONS) {
    const sortedKeywords = [...cat.keywords].sort((a, b) => b.length - a.length);
    for (const kw of sortedKeywords) {
      const regex = new RegExp(`(?:^|\\s|[,.!?;])${kw}(?:$|\\s|[,.!?;])`, 'i');
      if (regex.test(clean)) {
        return cat;
      }
    }
  }

  // Fallback category
  const fallback = CATEGORY_DEFINITIONS.find(c => c.key === (type === 'income' ? 'salary' : 'other')) 
    || CATEGORY_DEFINITIONS[CATEGORY_DEFINITIONS.length - 1];
  return fallback;
}

/**
 * Extract Date / Due Date
 */
export function extractDate(text) {
  const clean = text.toLowerCase();
  const now = new Date();

  // Tomorrow / Kal (future)
  if (clean.includes('kal') && (clean.includes('dena') || clean.includes('bharna') || clean.includes('aayega') || clean.includes('tomorrow'))) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  if (clean.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Yesterday / Kal (past)
  if (clean.includes('yesterday') || (clean.includes('kal') && (clean.includes('kiya') || clean.includes('diye') || clean.includes('kitte') || clean.includes('tha')))) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  // Day before yesterday / Parso
  if (clean.includes('parso') || clean.includes('day before yesterday')) {
    const dayBefore = new Date(now);
    dayBefore.setDate(dayBefore.getDate() - 2);
    return dayBefore;
  }

  // Default: Today
  return now;
}

/**
 * Extract Payment Method
 */
export function extractPaymentMethod(text) {
  const clean = text.toLowerCase();

  for (const [method, keywords] of Object.entries(PAYMENT_METHODS)) {
    for (const kw of keywords) {
      if (clean.includes(kw)) {
        return method;
      }
    }
  }

  return 'cash'; // Default fallback
}

/**
 * Extract a concise human-readable description
 */
export function extractDescription(text, category, amount) {
  if (!text || !text.trim()) return category?.name || 'Transaction';

  // Capitalize first letter of raw text as clean label
  let desc = text.trim();
  if (desc.length > 50) {
    desc = desc.substring(0, 50) + '...';
  }
  return desc.charAt(0).toUpperCase() + desc.slice(1);
}

/**
 * Master parser function
 */
export function parseVoiceInput(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      isValid: false,
      isAmbiguous: true,
      confidence: 0,
      errorMessage: 'Please speak or enter a voice command.',
      intent: 'unknown'
    };
  }

  const rawText = text.trim();
  const intentObj = extractIntent(rawText);

  // If intent is query summary or history
  if (intentObj.action === 'query_summary' || intentObj.action === 'query_history') {
    return {
      isValid: true,
      isAmbiguous: false,
      confidence: 0.95,
      intent: intentObj.action,
      period: intentObj.period,
      rawText
    };
  }

  // It's a transaction or planned expense
  const amount = extractAmount(rawText);
  const type = extractTransactionType(rawText);
  const categoryObj = extractCategory(rawText, type);
  const paymentMethod = extractPaymentMethod(rawText);
  const date = extractDate(rawText);
  const description = extractDescription(rawText, categoryObj, amount);

  // Confidence & Ambiguity calculation
  let confidence = 0.5;
  const reasons = [];

  if (amount !== null && amount > 0) {
    confidence += 0.3;
  } else {
    reasons.push('Amount could not be clearly identified.');
  }

  if (categoryObj && categoryObj.key !== 'other') {
    confidence += 0.15;
  }

  if (rawText.length >= 5) {
    confidence += 0.05;
  }

  confidence = Math.min(1.0, Math.round(confidence * 100) / 100);

  const isAmbiguous = amount === null || amount <= 0 || confidence < 0.65;

  return {
    isValid: !isAmbiguous,
    isAmbiguous,
    confidence,
    reasons,
    intent: intentObj.action, // 'add_transaction' or 'planned_expense'
    data: {
      type,
      amount: amount || 0,
      category: categoryObj.key,
      categoryName: categoryObj.name,
      categoryIcon: categoryObj.icon,
      description,
      date,
      paymentMethod,
      status: 'completed',
      source: 'voice',
      rawVoiceText: rawText
    }
  };
}
