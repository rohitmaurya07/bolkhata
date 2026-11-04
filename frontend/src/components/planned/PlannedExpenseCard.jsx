import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Clock, Trash2, Calendar, AlertCircle } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon.jsx';
import AmountDisplay from '../common/AmountDisplay.jsx';
import { markPlannedAsPaid, deletePlannedExpense } from '../../store/plannedSlice.js';
import { getTranslation } from '../../utils/i18n.js';

export default function PlannedExpenseCard({ item }) {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';

  const isPaid = item.status === 'paid';
  const dueDate = new Date(item.dueDate);
  const now = new Date();

  // Calculate days remaining
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dueBadgeText = '';
  let badgeColor = 'bg-slate-100 text-slate-700';

  if (isPaid) {
    dueBadgeText = getTranslation(language, 'paid');
    badgeColor = 'bg-emerald-100 text-emerald-800';
  } else if (diffDays < 0) {
    dueBadgeText = 'Overdue';
    badgeColor = 'bg-rose-100 text-rose-800 font-bold';
  } else if (diffDays === 0) {
    dueBadgeText = 'Due Today';
    badgeColor = 'bg-amber-100 text-amber-800 font-bold animate-pulse';
  } else if (diffDays === 1) {
    dueBadgeText = 'Due Tomorrow';
    badgeColor = 'bg-blue-100 text-blue-800';
  } else {
    dueBadgeText = `In ${diffDays} days`;
    badgeColor = 'bg-warm-200 text-slate-700';
  }

  const handleMarkPaid = () => {
    dispatch(markPlannedAsPaid(item._id));
  };

  const handleDelete = () => {
    dispatch(deletePlannedExpense(item._id));
  };

  return (
    <div className={`p-4 rounded-3xl bg-white border transition-all shadow-sm ${
      isPaid ? 'border-emerald-200 opacity-75' : 'border-warm-300'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CategoryIcon category={item.category || 'bills'} size="md" />
          <div>
            <h4 className="font-bold text-slate-900 text-base leading-tight">
              {item.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                {dueBadgeText}
              </span>
              <span className="text-xs text-slate-500">
                {dueDate.toLocaleDateString(
                  language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN',
                  { day: 'numeric', month: 'short' }
                )}
              </span>
            </div>
          </div>
        </div>

        <AmountDisplay amount={item.amount} type="neutral" size="md" />
      </div>

      {item.notes && (
        <p className="mt-2.5 text-xs text-slate-500 italic bg-warm-100 p-2 rounded-xl">
          {item.notes}
        </p>
      )}

      {/* Card Actions */}
      <div className="mt-3.5 pt-3 border-t border-warm-200 flex items-center justify-between">
        {!isPaid ? (
          <button
            onClick={handleMarkPaid}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <CheckCircle2 size={16} />
            <span>{getTranslation(language, 'markAsPaid')}</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 size={15} />
            <span>Added to expenses</span>
          </span>
        )}

        <button
          onClick={handleDelete}
          type="button"
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

