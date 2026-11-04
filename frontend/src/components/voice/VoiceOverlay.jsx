import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mic, MicOff, X, ArrowRight, Keyboard, Sparkles } from 'lucide-react';
import { closeVoiceModal } from '../../store/uiSlice.js';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { getTranslation } from '../../utils/i18n.js';

export default function VoiceOverlay() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isVoiceModalOpen);
  const language = useSelector((state) => state.auth.language) || 'hi';

  const {
    isListening,
    transcript,
    isParsing,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    processVoiceText,
  } = useSpeechRecognition();

  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowManualInput(false);
      setManualText('');
      // Auto-start listening when modal opens
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);

  if (!isOpen) return null;

  const quickSamples = [
    { label: '200 rupaye sabzi', text: 'Aaj 200 rupaye sabzi pe kharch kiye' },
    { label: '500 petrol', text: '500 rupees petrol' },
    { label: '5000 salary aayi', text: 'Received 5000 rupees salary' },
    { label: 'Kal 1000 bill dena hai', text: 'Kal 1000 rupaye bijli ka bill dena hai' },
  ];

  const handleSampleClick = (text) => {
    stopListening();
    processVoiceText(text);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualText.trim()) {
      processVoiceText(manualText.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-4">
      <div className="relative w-full max-w-md mx-auto bg-warm-100 rounded-3xl p-6 shadow-2xl border border-warm-300 animate-slide-up flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={() => {
            stopListening();
            dispatch(closeVoiceModal());
          }}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full bg-warm-200 text-slate-700 hover:bg-warm-300 active:scale-90 transition-all"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-slate-900 mt-2 text-center">
          {isListening
            ? getTranslation(language, 'listening')
            : isParsing
            ? 'Analyzing...'
            : getTranslation(language, 'tapToSpeak')}
        </h2>

        {/* Big Pulsing Mic Button */}
        <div className="relative my-8 flex items-center justify-center">
          {isListening && (
            <div className="absolute w-36 h-36 rounded-full bg-rose-400/30 animate-recording-pulse pointer-events-none" />
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            type="button"
            className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all border-4 border-white cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white shadow-rose-500/50'
                : 'bg-brand-500 text-white shadow-brand-500/40'
            }`}
          >
            {isListening ? (
              <Mic size={52} className="animate-pulse" />
            ) : (
              <MicOff size={46} />
            )}
          </button>
        </div>

        {/* Live Transcript / Feedback Box */}
        <div className="w-full min-h-[70px] p-4 rounded-2xl bg-white border border-warm-300 text-center flex items-center justify-center">
          {isParsing ? (
            <div className="flex items-center gap-2 text-brand-700 font-bold">
              <Sparkles className="animate-spin" size={18} />
              <span>Analyzing spoken command...</span>
            </div>
          ) : transcript ? (
            <p className="text-lg font-bold text-slate-800 italic">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : errorMessage ? (
            <p className="text-sm font-semibold text-rose-600">
              {errorMessage}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              {getTranslation(language, 'voicePromptExample')}
            </p>
          )}
        </div>

        {/* Quick Sample Voice Command Pills */}
        <div className="w-full mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Tap an example command:
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {quickSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                className="px-3 py-1.5 rounded-xl bg-white border border-warm-300 text-xs font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700 active:scale-95 transition-all shadow-sm"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fallback to Manual Text typing */}
        <div className="w-full mt-5 pt-3 border-t border-warm-300 flex flex-col items-center">
          {!showManualInput ? (
            <button
              onClick={() => {
                stopListening();
                setShowManualInput(true);
              }}
              type="button"
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600"
            >
              <Keyboard size={16} />
              <span>Or type command manually</span>
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="w-full flex gap-2 mt-1">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="e.g. 300 rupaye petrol diya"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-warm-400 bg-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={!manualText.trim()}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

