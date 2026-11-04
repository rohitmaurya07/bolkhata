import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { addTransaction } from '../store/transactionSlice.js';
import CategoryIcon from '../components/common/CategoryIcon.jsx';
import BigButton from '../components/common/BigButton.jsx';
import { getTranslation } from '../utils/i18n.js';
import confetti from 'canvas-confetti';

const EXPENSE_CATEGORIES = [
  { key: 'groceries', nameKey: 'groceries' },
  { key: 'travel', nameKey: 'travel' },
  { key: 'food', nameKey: 'food' },
  { key: 'bills', nameKey: 'bills' },
  { key: 'health', nameKey: 'health' },
  { key: 'shopping', nameKey: 'shopping' },
  { key: 'other', nameKey: 'other' },
];

export default function AddExpensePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.auth.language) || 'hi';

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('groceries');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickAmount = (val) => {
    setAmount(String((Number(amount) || 0) + val));
  };

  const createDateObject = (dateStr) => {
    if (!dateStr) return new Date();
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date();
    dt.setFullYear(y, m - 1, d);
    return dt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    const catName = getTranslation(language, 'categories', selectedCategory);

    try {
      await dispatch(
        addTransaction({
          type: 'expense',
          amount: Number(amount),
          category: selectedCategory,
          categoryName: catName,
          description: description.trim(),
          date: createDateObject(date).toISOString(),
          paymentMethod,
          source: 'manual',
        })
      ).unwrap();

      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
      } catch (_) {}

      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="p-2 rounded-2xl bg-white border border-warm-300 text-slate-700 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-extrabold text-slate-900">
          {getTranslation(language, 'addExpense')}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Huge Amount Input Display */}
        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 flex flex-col items-center justify-center">
          <label className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
            {getTranslation(language, 'amount')}
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-4xl font-extrabold text-rose-600">₹</span>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-48 text-center text-5xl font-black text-rose-700 bg-transparent focus:outline-none placeholder:text-rose-300"
            />
          </div>

          {/* Quick Add Chips */}
          <div className="flex gap-2 mt-4">
            {[50, 100, 200, 500].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="px-3 py-1 rounded-xl bg-white text-xs font-bold text-rose-700 border border-rose-200 shadow-sm active:scale-95"
              >
                +₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Category Selection Grid */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
            {getTranslation(language, 'category')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 shadow-md ring-2 ring-brand-500/30'
                      : 'bg-white border-warm-300 hover:border-slate-400'
                  }`}
                >
                  <CategoryIcon category={cat.key} size="md" />
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 text-center line-clamp-1 leading-tight">
                    {getTranslation(language, 'categories', cat.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
            {getTranslation(language, 'paymentMethod')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['cash', 'upi', 'bank'].map((m) => {
              const isSelected = paymentMethod === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-3 px-2 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-700 border-warm-300'
                  }`}
                >
                  {getTranslation(language, m)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date and Description Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600 block">
                {getTranslation(language, 'date')}
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().split('T')[0])}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                    date === new Date().toISOString().split('T')[0]
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-warm-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getTranslation(language, 'today')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setDate(y.toISOString().split('T')[0]);
                  }}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                    (() => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      return date === y.toISOString().split('T')[0];
                    })()
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-warm-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getTranslation(language, 'yesterday')}
                </button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white border border-warm-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">
              {getTranslation(language, 'notes')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Aloo tamatar"
              className="w-full p-3 rounded-2xl bg-white border border-warm-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Big Save Button */}
        <div className="pt-2">
          <BigButton
            type="submit"
            disabled={!amount || Number(amount) <= 0 || isSubmitting}
            variant="primary"
            icon={Check}
            size="xl"
            className="w-full"
          >
            {getTranslation(language, 'confirmSave')}
          </BigButton>
        </div>
      </form>
    </div>
  );
}

