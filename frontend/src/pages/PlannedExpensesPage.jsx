import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, CalendarClock, CheckCircle, Clock, X, Check } from 'lucide-react';
import { fetchPlannedExpenses, addPlannedExpense, setPlannedFilter } from '../store/plannedSlice.js';
import PlannedExpenseCard from '../components/planned/PlannedExpenseCard.jsx';
import BigButton from '../components/common/BigButton.jsx';
import { getTranslation } from '../utils/i18n.js';

export default function PlannedExpensesPage() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { items, filter, isLoading } = useSelector((state) => state.planned);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('bills');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchPlannedExpenses(filter));
  }, [dispatch, filter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    await dispatch(
      addPlannedExpense({
        title: title.trim(),
        amount: Number(amount),
        category,
        dueDate: new Date(dueDate).toISOString(),
        notes: notes.trim(),
        paymentMethod: 'cash',
      })
    );

    setTitle('');
    setAmount('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {getTranslation(language, 'planned')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            आने वाले बिल और जरूरी भुगतान
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>{getTranslation(language, 'addPlanned')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 rounded-2xl bg-warm-200 border border-warm-300">
        {['pending', 'paid', 'all'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => dispatch(setPlannedFilter(f))}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
              filter === f
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            {f === 'pending'
              ? getTranslation(language, 'pending')
              : f === 'paid'
              ? getTranslation(language, 'paid')
              : getTranslation(language, 'all')}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 pt-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <PlannedExpenseCard key={item._id} item={item} />
          ))
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-warm-300 text-center text-slate-400">
            <CalendarClock size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">No planned bills in this view</p>
            <p className="text-xs mt-1 text-slate-400">Add an upcoming bill to never forget payment</p>
          </div>
        )}
      </div>

      {/* Add Planned Bill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-4">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-3xl p-6 shadow-2xl border border-warm-300 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-warm-200">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {getTranslation(language, 'addPlanned')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                type="button"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  Bill Title (e.g. Bijli Bill, Rent, Room Kiraya):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bijli Bill"
                  required
                  className="w-full p-3 rounded-2xl border border-warm-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  {getTranslation(language, 'amount')}:
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹ 1000"
                  required
                  className="w-full p-3 rounded-2xl border border-warm-300 text-xl font-black text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    {getTranslation(language, 'dueDate')}:
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-2xl bg-white border border-warm-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    {getTranslation(language, 'category')}:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-warm-300 text-sm font-semibold text-slate-800"
                  >
                    <option value="bills">Bills & Electricity</option>
                    <option value="groceries">Groceries & Ration</option>
                    <option value="health">Medicine & Doctor</option>
                    <option value="travel">Vehicle / Fuel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  {getTranslation(language, 'notes')}:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional reminder notes"
                  className="w-full p-3 rounded-2xl border border-warm-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2">
                <BigButton
                  type="submit"
                  variant="primary"
                  icon={Check}
                  size="lg"
                  className="w-full"
                >
                  Save Upcoming Bill
                </BigButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

