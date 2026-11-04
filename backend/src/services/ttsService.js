/**
 * Audio Speech Summary Generator
 * Generates clear, friendly spoken texts in Hindi, Punjabi, and English.
 */

export function generateSummarySpeech({
  period = 'today',
  totalExpense = 0,
  totalIncome = 0,
  netBalance = 0,
  topCategory = null,
  transactionCount = 0,
  language = 'hi',
  currencySymbol = '₹'
}) {
  const expense = Math.round(totalExpense);
  const income = Math.round(totalIncome);
  const balance = Math.round(netBalance);

  if (language === 'hi') {
    const periodLabel = period === 'today' ? 'आज' :
      period === 'yesterday' ? 'कल' :
      period === 'week' ? 'इस हफ्ते' :
      period === 'month' ? 'इस महीने' : 'कुल';

    if (transactionCount === 0) {
      return `${periodLabel} का कोई भी लेनदेन दर्ज नहीं है।`;
    }

    let speech = `${periodLabel} आपने ${expense} रुपये खर्च किए`;
    if (income > 0) {
      speech += ` और ${income} रुपये की आमदनी हुई।`;
    } else {
      speech += `।`;
    }

    if (topCategory && topCategory.amount > 0) {
      speech += ` सबसे ज्यादा खर्च ${topCategory.amount} रुपये ${topCategory.name} पर हुआ।`;
    }

    if (income > 0) {
      if (balance >= 0) {
        speech += ` आपकी बचत ${balance} रुपये है।`;
      } else {
        speech += ` आपका खर्च आमदनी से ${Math.abs(balance)} रुपये ज्यादा है।`;
      }
    }
    return speech;
  }

  if (language === 'pa') {
    const periodLabel = period === 'today' ? 'ਅੱਜ' :
      period === 'yesterday' ? 'ਕੱਲ੍ਹ' :
      period === 'week' ? 'ਇਸ ਹਫ਼ਤੇ' :
      period === 'month' ? 'ਇਸ ਮਹੀਨੇ' : 'ਕੁੱਲ';

    if (transactionCount === 0) {
      return `${periodLabel} ਦਾ ਕੋਈ ਵੀ ਲੈਣ-ਦੇਣ ਦਰਜ ਨਹੀਂ ਹੈ।`;
    }

    let speech = `${periodLabel} ਤੁਸੀਂ ${expense} ਰੁਪਏ ਖਰਚ ਕੀਤੇ`;
    if (income > 0) {
      speech += ` ਅਤੇ ${income} ਰੁਪਏ ਕਮਾਏ।`;
    } else {
      speech += `।`;
    }

    if (topCategory && topCategory.amount > 0) {
      speech += ` ਸਭ ਤੋਂ ਵੱਧ ਖਰਚਾ ${topCategory.amount} ਰੁਪਏ ${topCategory.name} ਤੇ ਹੋਇਆ।`;
    }

    if (income > 0) {
      if (balance >= 0) {
        speech += ` ਤੁਹਾਡੀ ਬੱਚਤ ${balance} ਰੁਪਏ ਹੈ।`;
      } else {
        speech += ` ਖਰਚਾ ਕਮਾਈ ਨਾਲੋਂ ${Math.abs(balance)} ਰੁਪਏ ਵੱਧ ਹੈ।`;
      }
    }
    return speech;
  }

  // English default
  const periodLabel = period === 'today' ? 'Today' :
    period === 'yesterday' ? 'Yesterday' :
    period === 'week' ? 'This week' :
    period === 'month' ? 'This month' : 'In total';

  if (transactionCount === 0) {
    return `No transactions recorded for ${periodLabel.toLowerCase()}.`;
  }

  let speech = `${periodLabel}, you spent ${currencySymbol}${expense}`;
  if (income > 0) {
    speech += ` and received ${currencySymbol}${income}.`;
  } else {
    speech += `.`;
  }

  if (topCategory && topCategory.amount > 0) {
    speech += ` Highest spending was ${currencySymbol}${topCategory.amount} on ${topCategory.name}.`;
  }

  if (income > 0) {
    if (balance >= 0) {
      speech += ` Your net balance is ${currencySymbol}${balance}.`;
    } else {
      speech += ` You spent ${currencySymbol}${Math.abs(balance)} more than your income.`;
    }
  }

  return speech;
}

