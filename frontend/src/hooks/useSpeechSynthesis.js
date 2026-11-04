import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { speechAdapter } from '../utils/speechAdapter.js';

export function useSpeechSynthesis() {
  const language = useSelector((state) => state.auth.language) || 'hi';
  const voiceSpeed = useSelector((state) => state.auth.user?.voiceSpeed) || 1.0;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text, customLang = null) => {
    if (!text) return;
    setIsSpeaking(true);
    speechAdapter.speak(text, {
      language: customLang || language,
      rate: voiceSpeed,
      onEnd: () => setIsSpeaking(false),
    });
  }, [language, voiceSpeed]);

  const stop = useCallback(() => {
    speechAdapter.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
}

