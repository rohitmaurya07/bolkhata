import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, Check } from 'lucide-react';
import { setPeriodFilter } from '../../store/transactionSlice.js';
import { getTranslation } from '../../utils/i18n.js';

export default function FilterTabs({
  activePeriod,
  onChange,
  startDate,
  endDate,
  onCustomDateChange,
}) {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const currentPeriod = activePeriod || useSelector((state) => state.transactions.period);

  const todayStr = new Date().toISOString().split('T')[0];
  const [localStart, setLocalStart] = useState(startDate || todayStr);
  const [localEnd, setLocalEnd] = useState(endDate || todayStr);

  const tabs = [
    { key: 'today', labelKey: 'today' },
    { key: 'yesterday', labelKey: 'yesterday' },
    { key: 'week', labelKey: 'thisWeek' },
    { key: 'month', labelKey: 'thisMonth' },
    { key: 'custom', labelKey: 'custom', icon: Calendar },
  ];

  const handleSelect = (key) => {
    if (key === 'custom') {
      if (onChange) {
        onChange('custom', localStart, localEnd);
      } else {
        dispatch(setPeriodFilter('custom'));
      }
      if (onCustomDateChange) {
        onCustomDateChange(localStart, localEnd);
      }
    } else {
      if (onChange) {
        onChange(key);
      } else {
        dispatch(setPeriodFilter(key));
      }
    }
  };

  const handleQuickPreset = (days) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      // Today
    } else if (days === 1) {
      // Yesterday
      end.setDate(end.getDate() - 1);
      start.setDate(start.getDate() - 1);
    } else {
      start.setDate(start.getDate() - (days - 1));
    }

    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];
    setLocalStart(sStr);
    setLocalEnd(eStr);

    if (onChange) {
      onChange('custom', sStr, eStr);
    }
    if (onCustomDateChange) {
      onCustomDateChange(sStr, eStr);
    }
  };

  const handleApplyCustom = () => {
    if (onChange) {
      onChange('custom', localStart, localEnd);
    }
    if (onCustomDateChange) {
      onCustomDateChange(localStart, localEnd);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-warm-200/80 border border-warm-300 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentPeriod === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleSelect(tab.key)}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all select-none flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {Icon && <Icon size={13} className={isActive ? 'text-brand-600' : 'text-slate-400'} />}
              <span>{getTranslation(language, tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {currentPeriod === 'custom' && (
        <div className="p-3 rounded-2xl bg-white border border-warm-300 shadow-sm space-y-2.5">
          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">
              {getTranslation(language, 'filters')}:
            </span>
            <button
              type="button"
              onClick={() => handleQuickPreset(0)}
              className="px-2 py-0.5 rounded-lg text-xs font-bold bg-warm-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-warm-300 active:scale-95 transition-all"
            >
              {getTranslation(language, 'today')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(1)}
              className="px-2 py-0.5 rounded-lg text-xs font-bold bg-warm-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-warm-300 active:scale-95 transition-all"
            >
              {getTranslation(language, 'yesterday')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(7)}
              className="px-2 py-0.5 rounded-lg text-xs font-bold bg-warm-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-warm-300 active:scale-95 transition-all"
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(30)}
              className="px-2 py-0.5 rounded-lg text-xs font-bold bg-warm-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-warm-300 active:scale-95 transition-all"
            >
              30 Days
            </button>
          </div>

          {/* Date range pickers */}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                {getTranslation(language, 'startDate')}
              </label>
              <input
                type="date"
                value={localStart}
                onChange={(e) => {
                  setLocalStart(e.target.value);
                  if (onChange) onChange('custom', e.target.value, localEnd);
                  if (onCustomDateChange) onCustomDateChange(e.target.value, localEnd);
                }}
                className="w-full px-2 py-1.5 rounded-xl border border-warm-300 text-xs font-semibold text-slate-800 bg-warm-50 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                {getTranslation(language, 'endDate')}
              </label>
              <input
                type="date"
                value={localEnd}
                onChange={(e) => {
                  setLocalEnd(e.target.value);
                  if (onChange) onChange('custom', localStart, e.target.value);
                  if (onCustomDateChange) onCustomDateChange(localStart, e.target.value);
                }}
                className="w-full px-2 py-1.5 rounded-xl border border-warm-300 text-xs font-semibold text-slate-800 bg-warm-50 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="self-end pb-0.5">
              <button
                type="button"
                onClick={handleApplyCustom}
                className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 active:scale-95 transition-all shadow-xs"
                title={getTranslation(language, 'apply')}
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
