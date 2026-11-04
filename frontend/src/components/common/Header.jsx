import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, WifiOff, Volume2, User as UserIcon } from 'lucide-react';
import { setLanguage } from '../../store/authSlice.js';
import { getTranslation } from '../../utils/i18n.js';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, user, isAuthenticated } = useSelector((state) => state.auth);
  const { isOnline, isSyncing, pendingSyncCount } = useSelector((state) => state.ui);
  const summary = useSelector((state) => state.transactions.summary);
  const { speak } = useSpeechSynthesis();

  const handleLanguageCycle = () => {
    const order = ['hi', 'pa', 'en'];
    const currentIndex = order.indexOf(language);
    const nextLang = order[(currentIndex + 1) % order.length];
    dispatch(setLanguage(nextLang));
  };

  const langLabels = {
    hi: 'हिन्दी',
    pa: 'ਪੰਜਾਬੀ',
    en: 'English',
  };

  const handleHearOverview = () => {
    if (summary?.speechSummary) {
      speak(summary.speechSummary, language);
    } else {
      const msg = language === 'hi' ? 'बोल खाता में आपका स्वागत है।' :
                  language === 'pa' ? 'ਬੋਲ ਖਾਤਾ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।' :
                  'Welcome to BolKhata.';
      speak(msg, language);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-warm-100/95 backdrop-blur-md border-b border-warm-300 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            बोल
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-tight text-slate-900 tracking-tight">
              {getTranslation(language, 'appName')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {getTranslation(language, 'tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Offline Indicator */}
          {!isOnline && (
            <div
              title={getTranslation(language, 'offlineStatus')}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold"
            >
              <WifiOff size={13} />
              <span>Offline</span>
            </div>
          )}

          {/* Syncing Badge */}
          {isSyncing && (
            <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold animate-pulse">
              Syncing...
            </div>
          )}

          {/* Audio Overview Button */}
          <button
            onClick={handleHearOverview}
            type="button"
            className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center hover:bg-brand-100 active:scale-90 transition-all shadow-sm"
            title="Hear Audio Summary"
          >
            <Volume2 size={18} />
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={handleLanguageCycle}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-warm-300 hover:border-brand-500 text-slate-800 text-xs font-bold shadow-sm active:scale-95 transition-all"
            title="Switch Language"
          >
            <Globe size={14} className="text-brand-600" />
            <span>{langLabels[language] || 'हिन्दी'}</span>
          </button>

          {/* Profile / Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            type="button"
            className="w-9 h-9 rounded-full bg-white border border-warm-300 text-slate-700 flex items-center justify-center hover:border-brand-500 active:scale-90 transition-all shadow-sm"
          >
            <UserIcon size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}

