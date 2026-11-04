import React from 'react';
import { useSelector } from 'react-redux';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js';
import { getTranslation } from '../../utils/i18n.js';

export default function AudioSummaryPlayer({ period = 'today', className = '' }) {
  const language = useSelector((state) => state.auth.language) || 'hi';
  const summary = useSelector((state) => state.transactions.summary);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      if (summary?.speechSummary) {
        speak(summary.speechSummary, language);
      }
    }
  };

  return (
    <div className={`p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 border border-brand-200/80 shadow-soft ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-sm">
            <Volume2 size={24} className={isSpeaking ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <span>{getTranslation(language, 'listenSummary')}</span>
              <Sparkles size={14} className="text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {summary?.transactionCount > 0
                ? `${summary.transactionCount} transactions recorded`
                : getTranslation(language, 'noTransactions')}
            </p>
          </div>
        </div>

        {/* Play / Stop Audio Toggle Button */}
        <button
          onClick={handleToggle}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 ${
            isSpeaking
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX size={18} />
              <span>{getTranslation(language, 'stopListening')}</span>
            </>
          ) : (
            <>
              <Volume2 size={18} />
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      {/* Spoken subtitle card */}
      {summary?.speechSummary && (
        <div className="mt-3 pt-3 border-t border-brand-200/60 text-xs text-slate-700 italic leading-relaxed">
          &ldquo;{summary.speechSummary}&rdquo;
        </div>
      )}
    </div>
  );
}

