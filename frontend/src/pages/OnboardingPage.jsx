import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Volume2, ArrowRight, Check, Sparkles, Mic } from 'lucide-react';
import { setLanguage } from '../store/authSlice.js';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import BigButton from '../components/common/BigButton.jsx';
import { getTranslation } from '../utils/i18n.js';

export default function OnboardingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { speak } = useSpeechSynthesis();

  const [step, setStep] = useState(1);

  const languages = [
    { code: 'hi', label: 'हिन्दी', desc: 'Hindi' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', desc: 'Punjabi' },
    { code: 'en', label: 'English', desc: 'English' },
  ];

  const handleSelectLanguage = (code) => {
    dispatch(setLanguage(code));
    const welcome = code === 'hi' ? 'बोल खाता में आपका स्वागत है। बोलकर आसानी से हिसाब रखें।' :
                    code === 'pa' ? 'ਬੋਲ ਖਾਤਾ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਬੋਲ ਕੇ ਸੌਖਾ ਹਿਸਾਬ ਰੱਖੋ।' :
                    'Welcome to BolKhata. Track expenses simply by speaking.';
    speak(welcome, code);
  };

  const handleFinish = () => {
    localStorage.setItem('bolkhata_onboarded', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-warm-100 p-6 flex flex-col justify-between max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            बोल
          </div>
          <span className="font-extrabold text-xl text-slate-900">BolKhata</span>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-100 text-brand-800">
          Step {step} of 2
        </span>
      </div>

      {/* Step Content */}
      <div className="my-auto py-8 space-y-6">
        {step === 1 ? (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                अपनी भाषा चुनें
              </h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                Choose your language / ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {languages.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 shadow-md ring-2 ring-brand-500/20'
                        : 'bg-white border-warm-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-xl font-extrabold text-slate-900 block">{item.label}</span>
                      <span className="text-xs text-slate-500">{item.desc}</span>
                    </div>

                    {isSelected && (
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shadow-mic">
              <Mic size={48} className="animate-pulse" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {language === 'hi'
                  ? 'बोलिए और हिसाब दर्ज'
                  : language === 'pa'
                  ? 'ਬੋਲੋ ਅਤੇ ਹਿਸਾਬ ਦਰਜ'
                  : 'Speak & Track Easily'}
              </h2>
              <p className="text-sm text-slate-600 mt-2 font-medium px-4">
                {language === 'hi'
                  ? 'बस माइक दबाइए और बोलिए "200 रुपये सब्ज़ी" या "500 रुपये पेट्रोल"'
                  : language === 'pa'
                  ? 'ਬਸ ਮਾਈਕ ਦਬਾਓ ਤੇ ਬੋਲੋ "200 ਰੁਪਏ ਸਬਜ਼ੀ" ਜਾਂ "500 ਰੁਪਏ ਪੈਟਰੋਲ"'
                  : 'Just tap the mic and say "200 rupees groceries" or "500 petrol"'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-warm-300 text-xs text-slate-700 italic">
              ✨ {getTranslation(language, 'voicePromptExample')}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="pb-4">
        {step === 1 ? (
          <BigButton
            onClick={() => setStep(2)}
            variant="primary"
            icon={ArrowRight}
            size="xl"
            className="w-full"
          >
            आगे बढ़ें / Continue
          </BigButton>
        ) : (
          <BigButton
            onClick={handleFinish}
            variant="primary"
            icon={Check}
            size="xl"
            className="w-full"
          >
            शुरू करें / Get Started
          </BigButton>
        )}
      </div>
    </div>
  );
}

