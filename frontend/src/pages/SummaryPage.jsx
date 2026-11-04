import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, FileText, Sparkles, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { fetchSummary } from '../store/transactionSlice.js';
import FilterTabs from '../components/transactions/FilterTabs.jsx';
import AudioSummaryPlayer from '../components/common/AudioSummaryPlayer.jsx';
import AmountDisplay from '../components/common/AmountDisplay.jsx';
import CategoryIcon from '../components/common/CategoryIcon.jsx';
import { getTranslation } from '../utils/i18n.js';
import { api } from '../api/client.js';

const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#059669', '#6B7280'];

export default function SummaryPage() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { summary, isSummaryLoading } = useSelector((state) => state.transactions);

  const todayStr = new Date().toISOString().split('T')[0];
  const [activePeriod, setActivePeriod] = useState('week'); // 'today', 'yesterday', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  useEffect(() => {
    if (activePeriod === 'custom') {
      dispatch(fetchSummary({ period: 'custom', language, startDate, endDate }));
    } else {
      dispatch(fetchSummary({ period: activePeriod, language }));
    }
  }, [dispatch, activePeriod, language, startDate, endDate]);

  const handlePeriodChange = (newPeriod, newStart, newEnd) => {
    setActivePeriod(newPeriod);
    if (newStart) setStartDate(newStart);
    if (newEnd) setEndDate(newEnd);
  };

  const chartData = (summary.categoryBreakdown || []).map((cat, idx) => ({
    name: cat.name || getTranslation(language, 'categories', cat.category),
    value: cat.amount,
    category: cat.category,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Page Title & Export */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-900">
          {getTranslation(language, 'analytics')}
        </h2>

        <div className="flex items-center gap-2">
          <a
            href={api.getCSVUrl(activePeriod, activePeriod === 'custom' ? startDate : undefined, activePeriod === 'custom' ? endDate : undefined)}
            download
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-warm-300 text-slate-700 hover:text-brand-700 text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <Download size={14} />
            <span>CSV</span>
          </a>
          <a
            href={api.getPDFUrl(activePeriod, activePeriod === 'custom' ? startDate : undefined, activePeriod === 'custom' ? endDate : undefined)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <FileText size={14} />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Audio Text-To-Speech Summary Player */}
      <AudioSummaryPlayer period={activePeriod} />

      {/* Financial Totals Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200">
          <span className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1">
            <ArrowDownRight size={14} />
            Total Expense
          </span>
          <AmountDisplay
            amount={summary.totalExpense}
            type="expense"
            size="lg"
            className="mt-1"
          />
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200">
          <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
            <ArrowUpRight size={14} />
            Total Income
          </span>
          <AmountDisplay
            amount={summary.totalIncome}
            type="income"
            size="lg"
            className="mt-1"
          />
        </div>
      </div>

      {/* Visual Category Spending Breakdown Chart (Simple, never overwhelming) */}
      <div className="p-5 rounded-3xl bg-white border border-warm-300 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
          <span>Category Breakdown</span>
          <Sparkles size={16} className="text-brand-600" />
        </h3>

        {chartData.length > 0 ? (
          <>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend list with amounts and percentage */}
            <div className="space-y-2 pt-2 border-t border-warm-200">
              {chartData.map((item) => {
                const pct = summary.totalExpense > 0
                  ? Math.round((item.value / summary.totalExpense) * 100)
                  : 0;

                return (
                  <div key={item.category} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <CategoryIcon category={item.category} size="sm" />
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">{pct}%</span>
                      <AmountDisplay amount={item.value} size="sm" type="expense" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-10 text-center text-slate-400 text-sm">
            <p>No expense data recorded for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}

