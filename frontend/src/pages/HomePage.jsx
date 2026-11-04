import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowUpRight, ArrowDownRight, ChevronRight, TrendingUp, Sparkles } from 'lucide-react';
import { fetchSummary, fetchTransactions } from '../store/transactionSlice.js';
import AmountDisplay from '../components/common/AmountDisplay.jsx';
import MicButton from '../components/common/MicButton.jsx';
import BigButton from '../components/common/BigButton.jsx';
import AudioSummaryPlayer from '../components/common/AudioSummaryPlayer.jsx';
import TransactionCard from '../components/transactions/TransactionCard.jsx';
import { getTranslation } from '../utils/i18n.js';

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { summary, items: transactions, isLoading } = useSelector((state) => state.transactions);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchSummary({ period: 'today', language }));
    dispatch(fetchTransactions({ period: 'today', limit: 5 }));
  }, [dispatch, language]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Friendly greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-500">
            {language === 'hi' ? 'नमस्ते,' : language === 'pa' ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ,' : 'Hello,'}
          </h2>
          <p className="text-xl font-extrabold text-slate-900">
            {user?.name || 'BolKhata User'}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center gap-1">
          <Sparkles size={13} />
          <span>{getTranslation(language, 'today')}</span>
        </div>
      </div>

      {/* Main Financial Balance & Summary Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
        <div className="relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            {getTranslation(language, 'todayExpense')}
          </span>
          <div className="mt-1">
            <AmountDisplay
              amount={summary.totalExpense}
              type="neutral"
              size="xl"
              className="text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/60">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <ArrowUpRight size={13} />
                {getTranslation(language, 'todayIncome')}
              </span>
              <AmountDisplay
                amount={summary.totalIncome}
                type="income"
                size="md"
                className="mt-0.5 text-emerald-400"
              />
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <TrendingUp size={13} />
                {getTranslation(language, 'netBalance')}
              </span>
              <AmountDisplay
                amount={summary.netBalance}
                type="balance"
                size="md"
                className="mt-0.5 text-emerald-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audio Text-To-Speech Summary Player */}
      <AudioSummaryPlayer period="today" />

      {/* PROMINENT CENTRAL MICROPHONE BUTTON */}
      <MicButton />

      {/* Large Manual Entry Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <BigButton
          onClick={() => navigate('/add-expense')}
          variant="expense"
          icon={Minus}
          size="lg"
        >
          {getTranslation(language, 'addExpense')}
        </BigButton>

        <BigButton
          onClick={() => navigate('/add-income')}
          variant="income"
          icon={Plus}
          size="lg"
        >
          {getTranslation(language, 'addIncome')}
        </BigButton>
      </div>

      {/* Recent Transactions List Preview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900">
            {getTranslation(language, 'recentTransactions')}
          </h3>
          <button
            onClick={() => navigate('/history')}
            type="button"
            className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
          >
            <span>{getTranslation(language, 'viewAll')}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((txn) => (
              <TransactionCard key={txn._id || txn.offlineId} transaction={txn} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-warm-300 text-center text-slate-400">
            <p className="font-medium text-sm">{getTranslation(language, 'noTransactions')}</p>
            <p className="text-xs mt-1 text-slate-400">माइक दबाकर बोलें या ऊपर दिए बटन से जोड़ें</p>
          </div>
        )}
      </div>
    </div>
  );
}

