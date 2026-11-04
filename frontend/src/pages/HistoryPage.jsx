import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Download, FileText, Calendar, X, Edit3, Check, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { fetchTransactions, updateTransaction } from '../store/transactionSlice.js';
import FilterTabs from '../components/transactions/FilterTabs.jsx';
import TransactionCard from '../components/transactions/TransactionCard.jsx';
import AmountDisplay from '../components/common/AmountDisplay.jsx';
import { getTranslation } from '../utils/i18n.js';
import { api } from '../api/client.js';

export default function HistoryPage() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { items: transactions, period } = useSelector((state) => state.transactions);

  const todayStr = new Date().toISOString().split('T')[0];
  const [activePeriod, setActivePeriod] = useState(period || 'today');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'expense', 'income'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (activePeriod === 'custom') {
      dispatch(fetchTransactions({ period: 'custom', startDate, endDate }));
    } else {
      dispatch(fetchTransactions({ period: activePeriod }));
    }
  }, [dispatch, activePeriod, startDate, endDate]);

  const handlePeriodChange = (newPeriod, newStart, newEnd) => {
    setActivePeriod(newPeriod);
    if (newStart) setStartDate(newStart);
    if (newEnd) setEndDate(newEnd);
  };

  // Client-side filtering for type and search
  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchDesc = t.description?.toLowerCase().includes(s);
      const matchCat = t.categoryName?.toLowerCase().includes(s) || t.category?.toLowerCase().includes(s);
      const matchVoice = t.rawVoiceText?.toLowerCase().includes(s);
      if (!matchDesc && !matchCat && !matchVoice) return false;
    }
    return true;
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, txn) => {
    const dateObj = txn.date ? new Date(txn.date) : new Date();
    const dateKey = !isNaN(dateObj.getTime())
      ? dateObj.toISOString().split('T')[0]
      : 'unknown';

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateObj,
        items: [],
        totalExpense: 0,
        totalIncome: 0,
      };
    }
    groups[dateKey].items.push(txn);
    if (txn.type === 'expense') {
      groups[dateKey].totalExpense += Number(txn.amount) || 0;
    } else {
      groups[dateKey].totalIncome += Number(txn.amount) || 0;
    }
    return groups;
  }, {});

  const sortedDateKeys = Object.keys(groupedTransactions).sort((a, b) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return new Date(b) - new Date(a);
  });

  const formatGroupHeader = (dateObj) => {
    if (isNaN(dateObj.getTime())) return getTranslation(language, 'date');
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();

    const formattedDate = dateObj.toLocaleDateString(
      language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN',
      { day: 'numeric', month: 'short' }
    );

    if (isToday) return `${getTranslation(language, 'today')} (${formattedDate})`;
    if (isYesterday) return `${getTranslation(language, 'yesterday')} (${formattedDate})`;

    return dateObj.toLocaleDateString(
      language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN',
      { weekday: 'short', day: 'numeric', month: 'short', year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined }
    );
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTransaction) return;

    await dispatch(
      updateTransaction({
        id: editingTransaction._id || editingTransaction.offlineId,
        updates: {
          amount: Number(editingTransaction.amount),
          description: editingTransaction.description,
          paymentMethod: editingTransaction.paymentMethod,
          date: editingTransaction.date,
        },
      })
    );
    setEditingTransaction(null);
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Page Title & Exports */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-900">
          {getTranslation(language, 'history')}
        </h2>

        <div className="flex items-center gap-2">
          <a
            href={api.getCSVUrl(activePeriod, activePeriod === 'custom' ? startDate : undefined, activePeriod === 'custom' ? endDate : undefined)}
            download
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-warm-300 text-slate-700 hover:text-brand-700 text-xs font-bold shadow-sm active:scale-95 transition-all"
            title="Download CSV"
          >
            <Download size={14} />
            <span>CSV</span>
          </a>
          <a
            href={api.getPDFUrl(activePeriod, activePeriod === 'custom' ? startDate : undefined, activePeriod === 'custom' ? endDate : undefined)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-sm active:scale-95 transition-all"
            title="Download PDF"
          >
            <FileText size={14} />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <FilterTabs
        activePeriod={activePeriod}
        onChange={handlePeriodChange}
        startDate={startDate}
        endDate={endDate}
        onCustomDateChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
      />

      {/* Type Toggle & Search */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getTranslation(language, 'search')}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-warm-300 text-xs font-medium focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex p-0.5 rounded-xl bg-warm-200 border border-warm-300">
          {['all', 'expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                typeFilter === t
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              {t === 'all' ? getTranslation(language, 'all') : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Transactions List by Date */}
      <div className="space-y-4 pt-1">
        {sortedDateKeys.length > 0 ? (
          sortedDateKeys.map((dateKey) => {
            const group = groupedTransactions[dateKey];
            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-700">
                    <Calendar size={13} className="text-brand-600" />
                    <span>{formatGroupHeader(group.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-[11px]">
                    {group.totalExpense > 0 && (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 flex items-center gap-0.5">
                        <ArrowDownRight size={11} />
                        ₹{group.totalExpense.toLocaleString('en-IN')}
                      </span>
                    )}
                    {group.totalIncome > 0 && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                        <ArrowUpRight size={11} />
                        ₹{group.totalIncome.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* List of transaction cards under this date */}
                <div className="space-y-2">
                  {group.items.map((txn) => (
                    <TransactionCard
                      key={txn._id || txn.offlineId}
                      transaction={txn}
                      onEdit={setEditingTransaction}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-warm-300 text-center text-slate-400">
            <p className="font-semibold text-sm">{getTranslation(language, 'noTransactions')}</p>
            <p className="text-xs mt-1 text-slate-400">इस समयावधि के लिए कोई लेनदेन नहीं है</p>
          </div>
        )}
      </div>

      {/* Inline Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-4">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-3xl p-6 shadow-2xl border border-warm-300 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-warm-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 size={18} className="text-brand-600" />
                <span>{getTranslation(language, 'manualEdit')}</span>
              </h3>
              <button
                onClick={() => setEditingTransaction(null)}
                type="button"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  {getTranslation(language, 'amount')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, amount: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl border border-warm-300 text-2xl font-black text-slate-900 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              {/* Date Input with Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 block">
                    {getTranslation(language, 'date')}
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setEditingTransaction({ ...editingTransaction, date: now.toISOString() });
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-warm-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
                    >
                      {getTranslation(language, 'today')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const y = new Date();
                        y.setDate(y.getDate() - 1);
                        setEditingTransaction({ ...editingTransaction, date: y.toISOString() });
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-warm-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
                    >
                      {getTranslation(language, 'yesterday')}
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={
                    editingTransaction.date
                      ? new Date(editingTransaction.date).toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]
                  }
                  onChange={(e) => {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const dt = new Date(editingTransaction.date || Date.now());
                    dt.setFullYear(y, m - 1, d);
                    setEditingTransaction({ ...editingTransaction, date: dt.toISOString() });
                  }}
                  className="w-full p-3 rounded-2xl bg-white border border-warm-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  {getTranslation(language, 'paymentMethod')}
                </label>
                <select
                  value={editingTransaction.paymentMethod || 'cash'}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, paymentMethod: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl bg-white border border-warm-300 text-sm font-semibold text-slate-800"
                >
                  <option value="cash">{getTranslation(language, 'cash')}</option>
                  <option value="upi">{getTranslation(language, 'upi')}</option>
                  <option value="bank">{getTranslation(language, 'bank')}</option>
                  <option value="card">{getTranslation(language, 'card')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  {getTranslation(language, 'notes')}
                </label>
                <input
                  type="text"
                  value={editingTransaction.description || ''}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, description: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl border border-warm-300 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <Check size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
