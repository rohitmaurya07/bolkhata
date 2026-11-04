import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, ReceiptText, BarChart3, CalendarClock, Target } from 'lucide-react';
import { getTranslation } from '../../utils/i18n.js';

export default function BottomNav() {
  const language = useSelector((state) => state.auth.language) || 'hi';

  const navItems = [
    { to: '/', icon: Home, labelKey: 'appName' },
    { to: '/history', icon: ReceiptText, labelKey: 'history' },
    { to: '/summary', icon: BarChart3, labelKey: 'analytics' },
    { to: '/planned', icon: CalendarClock, labelKey: 'planned' },
    { to: '/budget', icon: Target, labelKey: 'budget' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-warm-300 py-1.5 px-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] transition-all select-none ${
                  isActive
                    ? 'text-brand-600 font-bold bg-brand-50 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[11px] mt-1 line-clamp-1 leading-tight">
                    {getTranslation(language, item.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

