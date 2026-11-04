import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Volume2,
  Download,
  FileText,
  User,
  LogOut,
  LogIn,
  Wifi,
  WifiOff,
  RefreshCw,
  Check
} from 'lucide-react';
import { setLanguage, logoutUser, updateUserProfile } from '../store/authSlice.js';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import { useOfflineSync } from '../hooks/useOfflineSync.js';
import { getTranslation } from '../utils/i18n.js';
import { api } from '../api/client.js';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language, user, isAuthenticated } = useSelector((state) => state.auth);
  const { isOnline, isSyncing } = useSelector((state) => state.ui);
  const { speak } = useSpeechSynthesis();
  const { syncPendingQueue } = useOfflineSync();

  const languages = [
    { code: 'hi', label: 'हिन्दी', desc: 'Hindi' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', desc: 'Punjabi' },
    { code: 'en', label: 'English', desc: 'English' },
  ];

  const handleLanguageChange = (code) => {
    dispatch(setLanguage(code));
    if (isAuthenticated) {
      dispatch(updateUserProfile({ preferredLanguage: code }));
    }
    const welcome = code === 'hi' ? 'भाषा हिन्दी सेट कर दी गई है।' :
                    code === 'pa' ? 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਸੈੱਟ ਕੀਤੀ ਗਈ ਹੈ।' :
                    'Language set to English.';
    speak(welcome, code);
  };

  const handleSpeedChange = (speed) => {
    dispatch(updateUserProfile({ voiceSpeed: speed }));
    speak('Testing voice playback speed.', language);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          {getTranslation(language, 'settings')}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          अपनी पसंद और ऐप सेटिंग्स
        </p>
      </div>

      {/* Language Section */}
      <div className="p-5 rounded-3xl bg-white border border-warm-300 shadow-sm space-y-3">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Globe size={16} className="text-brand-600" />
          <span>{getTranslation(language, 'language')}</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleLanguageChange(item.code)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20 font-bold'
                    : 'bg-warm-50 border-warm-300 text-slate-700 hover:border-slate-400 font-medium'
                }`}
              >
                <span className="text-base font-extrabold">{item.label}</span>
                <span className="text-[11px] text-slate-500 mt-0.5">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Speed Setting */}
      <div className="p-5 rounded-3xl bg-white border border-warm-300 shadow-sm space-y-3">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Volume2 size={16} className="text-brand-600" />
          <span>{getTranslation(language, 'voiceSpeed')}</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '0.8x Slow', speed: 0.8 },
            { label: '1.0x Normal', speed: 1.0 },
            { label: '1.2x Fast', speed: 1.2 },
          ].map((item) => {
            const currentSpeed = user?.voiceSpeed || 1.0;
            const isSelected = Math.abs(currentSpeed - item.speed) < 0.05;
            return (
              <button
                key={item.speed}
                type="button"
                onClick={() => handleSpeedChange(item.speed)}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-warm-50 border-warm-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Records (Requirement 14) */}
      <div className="p-5 rounded-3xl bg-white border border-warm-300 shadow-sm space-y-3">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Download size={16} className="text-brand-600" />
          <span>{getTranslation(language, 'exportData')}</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={api.getCSVUrl()}
            download
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white border border-warm-300 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-sm active:scale-95 transition-all text-center"
          >
            <Download size={16} className="text-brand-600" />
            <span>{getTranslation(language, 'downloadCSV')}</span>
          </a>

          <a
            href={api.getPDFUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-brand-50 border border-brand-200 hover:border-brand-300 text-brand-800 text-xs font-bold shadow-sm active:scale-95 transition-all text-center"
          >
            <FileText size={16} className="text-brand-700" />
            <span>{getTranslation(language, 'downloadPDF')}</span>
          </a>
        </div>
      </div>

      {/* Cloud Backup & Offline Status */}
      <div className="p-5 rounded-3xl bg-white border border-warm-300 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            {isOnline ? (
              <Wifi size={18} className="text-emerald-600" />
            ) : (
              <WifiOff size={18} className="text-rose-500" />
            )}
            <span>
              {isOnline
                ? getTranslation(language, 'onlineStatus')
                : getTranslation(language, 'offlineStatus')}
            </span>
          </div>

          {isOnline && (
            <button
              onClick={syncPendingQueue}
              disabled={isSyncing}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-warm-200 hover:bg-warm-300 text-slate-700 text-xs font-bold active:scale-95"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sync Now</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          BolKhata stores all records locally in IndexedDB when you are disconnected and synchronizes them to MongoDB Atlas as soon as you reconnect.
        </p>
      </div>

      {/* User Account / Auth Section */}
      <div className="p-5 rounded-3xl bg-white border border-warm-300 shadow-sm space-y-3">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.identifier}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold"
            >
              <LogOut size={16} />
              <span>{getTranslation(language, 'logout')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm font-bold text-slate-800">
              Back up your data to the cloud
            </p>
            <button
              onClick={() => navigate('/login')}
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <LogIn size={18} />
              <span>{getTranslation(language, 'login')} / {getTranslation(language, 'register')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

