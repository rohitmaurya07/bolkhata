import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Mic, Clock, CreditCard, ChevronRight } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon.jsx';
import AmountDisplay from '../common/AmountDisplay.jsx';
import { deleteTransaction } from '../../store/transactionSlice.js';
import { showUndoToast } from '../../store/uiSlice.js';
import { getTranslation } from '../../utils/i18n.js';

export default function TransactionCard({ transaction, onEdit }) {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';

  const isExpense = transaction.type === 'expense';

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteTransaction(transaction._id || transaction.offlineId));
    dispatch(
      showUndoToast({
        item: transaction,
        message: `${getTranslation(language, 'deletedSuccess')} (₹${transaction.amount})`,
      })
    );
  };

  const formatDateTime = () => {
    if (!transaction.date) return { dateStr: '', timeStr: '' };
    const d = new Date(transaction.date);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    let dateStr = '';
    if (isToday) {
      dateStr = getTranslation(language, 'today');
    } else if (isYesterday) {
      dateStr = getTranslation(language, 'yesterday');
    } else {
      dateStr = d.toLocaleDateString(
        language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN',
        { day: 'numeric', month: 'short', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined }
      );
    }

    const timeStr = d.toLocaleTimeString(
      language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN',
      { hour: '2-digit', minute: '2-digit', hour12: true }
    );

    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime();

  return (
    <div
      onClick={() => onEdit && onEdit(transaction)}
      className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-white border border-warm-300 hover:border-brand-300 shadow-sm transition-all select-none active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <CategoryIcon category={transaction.category} size="md" />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 text-base leading-tight truncate">
              {transaction.categoryName || getTranslation(language, 'categories', transaction.category)}
            </h4>
            {transaction.source === 'voice' && (
              <span title="Added via voice" className="text-brand-600">
                <Mic size={13} />
              </span>
            )}
            {transaction.isOffline && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                Offline
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium flex-wrap">
            <span className="font-bold text-slate-700">{dateStr}</span>
            {timeStr && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-[11px]">{timeStr}</span>
              </>
            )}
            <span className="text-slate-300">•</span>
            <span className="uppercase text-[11px] font-bold tracking-wider px-1.5 py-0.2 rounded bg-warm-200 text-slate-700">
              {getTranslation(language, transaction.paymentMethod || 'cash')}
            </span>
            {transaction.description && (
              <>
                <span className="text-slate-300">•</span>
                <span className="truncate max-w-[120px] text-slate-600">{transaction.description}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-2">
        <AmountDisplay
          amount={transaction.amount}
          type={isExpense ? 'expense' : 'income'}
          size="md"
          showSign={true}
        />

        {/* Delete button */}
        <button
          onClick={handleDelete}
          type="button"
          aria-label="Delete"
          className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

