import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Mic, Sparkles } from 'lucide-react';
import { openVoiceModal } from '../../store/uiSlice.js';
import { getTranslation } from '../../utils/i18n.js';

export default function MicButton() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';

  const handleClick = () => {
    dispatch(openVoiceModal());
  };

  return (
    <div className="flex flex-col items-center justify-center my-6 select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-28 h-28 rounded-full bg-brand-400/25 animate-mic-pulse pointer-events-none" />

        {/* Large Main Microphone Button */}
        <button
          onClick={handleClick}
          type="button"
          aria-label={getTranslation(language, 'tapToSpeak')}
          className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 text-white flex items-center justify-center shadow-mic active:scale-95 transition-all duration-200 border-4 border-white cursor-pointer"
        >
          <Mic size={42} strokeWidth={2.4} className="drop-shadow-sm" />
          <Sparkles size={16} className="absolute top-3.5 right-3.5 text-emerald-100 animate-pulse" />
        </button>
      </div>

      {/* Primary Action Label */}
      <p className="mt-3 text-lg font-bold text-slate-800 text-center tracking-tight">
        {getTranslation(language, 'tapToSpeak')}
      </p>

      {/* Subtle Helpful Example */}
      <span className="mt-0.5 text-xs text-slate-500 text-center px-4">
        {getTranslation(language, 'voicePromptExample')}
      </span>
    </div>
  );
}

