import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPeriodFilter } from '../../store/transactionSlice.js';
import { getTranslation } from '../../utils/i18n.js';

export default function FilterTabs({ activePeriod, onChange }) {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const currentPeriod = activePeriod || useSelector((state) => state.transactions.period);

  const tabs = [
    { key: 'today', labelKey: 'today' },
    { key: 'yesterday', labelKey: 'yesterday' },
    { key: 'week', labelKey: 'thisWeek' },
    { key: 'month', labelKey: 'thisMonth' },
  ];

  const handleSelect = (key) => {
    if (onChange) {
      onChange(key);
    } else {
      dispatch(setPeriodFilter(key));
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-warm-200/80 border border-warm-300 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = currentPeriod === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleSelect(tab.key)}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all select-none ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {getTranslation(language, tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

