import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Target, AlertTriangle, CheckCircle, Edit3, Check, Sparkles, TrendingDown } from 'lucide-react';
import { fetchBudget, saveBudget } from '../store/budgetSlice.js';
import AmountDisplay from '../components/common/AmountDisplay.jsx';
import BigButton from '../components/common/BigButton.jsx';
import { getTranslation } from '../utils/i18n.js';

export default function BudgetPage() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { data: budgetData, isLoading } = useSelector((state) => state.budget);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  useEffect(() => {
    dispatch(fetchBudget(currentMonth));
  }, [dispatch, currentMonth]);

  const { totalBudget = 0, totalSpent = 0, remaining = 0, percentageUsed = 0, isOverBudget = false, overBudgetAmount = 0 } = budgetData || {};

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newBudgetAmount || Number(newBudgetAmount) < 0) return;

    await dispatch(
      saveBudget({
        month: currentMonth,
        totalBudget: Number(newBudgetAmount),
      })
    );
    setIsEditing(false);
  };

  // Status color logic
  let meterColor = 'bg-brand-500';
  if (isOverBudget) meterColor = 'bg-rose-500';
  else if (percentageUsed > 80) meterColor = 'bg-amber-500';

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {getTranslation(language, 'budget')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => {
            setNewBudgetAmount(String(totalBudget || ''));
            setIsEditing(!isEditing);
          }}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-warm-300 hover:border-brand-500 text-xs font-bold text-slate-800 shadow-sm active:scale-95"
        >
          <Edit3 size={14} />
          <span>{isEditing ? 'Cancel' : getTranslation(language, 'setBudget')}</span>
        </button>
      </div>

      {/* Over-budget alert */}
      {isOverBudget && (
        <div className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-center gap-3">
          <AlertTriangle size={24} className="text-rose-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">{getTranslation(language, 'overBudget')}</h4>
            <p className="text-xs">
              You exceeded the budget by ₹{overBudgetAmount.toLocaleString('en-IN')}.
            </p>
          </div>
        </div>
      )}

      {/* Main Budget Card */}
      <div className="p-6 rounded-3xl bg-white border border-warm-300 shadow-soft space-y-4">
        {/* Total Budget Row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation(language, 'totalBudget')}
            </span>
            <div className="mt-0.5">
              <AmountDisplay amount={totalBudget} size="lg" type="neutral" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation(language, 'remaining')}
            </span>
            <div className="mt-0.5">
              <AmountDisplay
                amount={remaining}
                size="lg"
                type={isOverBudget ? 'expense' : 'income'}
              />
            </div>
          </div>
        </div>

        {/* Visual Progress Meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Spent: ₹{totalSpent.toLocaleString('en-IN')}</span>
            <span>{percentageUsed}% used</span>
          </div>

          <div className="w-full h-4 rounded-full bg-warm-200 overflow-hidden">
            <div
              className={`h-full ${meterColor} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(100, percentageUsed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Edit Budget Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-5 rounded-3xl bg-warm-50 border border-brand-300 space-y-3">
          <label className="text-xs font-extrabold text-brand-900 uppercase tracking-wider block">
            Set Monthly Spending Limit (₹):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="100"
              value={newBudgetAmount}
              onChange={(e) => setNewBudgetAmount(e.target.value)}
              placeholder="e.g. 15000"
              className="flex-1 p-3 rounded-2xl bg-white border border-warm-300 text-xl font-bold text-slate-900 focus:outline-none focus:border-brand-500"
              autoFocus
            />
            <button
              type="submit"
              className="py-3 px-5 rounded-2xl bg-brand-600 text-white font-bold text-sm shadow-sm active:scale-95"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Budget Tips Card */}
      <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
        <h4 className="font-bold flex items-center gap-1.5 text-sm">
          <Sparkles size={16} className="text-emerald-700" />
          <span>Simple Budgeting Tip</span>
        </h4>
        <p className="leading-relaxed">
          Setting a monthly budget keeps your expenses disciplined. BolKhata notifies you whenever your expenses cross 80% of your target limit.
        </p>
      </div>
    </div>
  );
}

