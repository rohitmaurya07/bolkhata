/**
 * Modular Speech Recognition and Speech Synthesis Adapter for BolKhata
 */

class SpeechAdapter {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.isSupported = true;
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  /**
   * Map BolKhata language code to BCP-47 locale
   */
  getLanguageLocale(lang) {
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'pa':
        return 'pa-Guru-IN'; // Punjabi Gurmukhi India; fallback will also understand Hindi/Punjabi words
      case 'en':
      default:
        return 'en-IN';
    }
  }

  /**
   * Start listening for voice input
   */
  startListening({ language = 'hi', onResult, onEnd, onError, onStart }) {
    if (!this.isSupported || !this.recognition) {
      if (onError) onError(new Error('Speech recognition is not supported in this browser.'));
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.lang = this.getLanguageLocale(language);

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (onResult) {
          onResult({
            transcript: finalTranscript || interimTranscript,
            isFinal: !!finalTranscript,
          });
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        console.warn('[BolKhata SpeechAdapter] Recognition error:', event.error);
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.isListening = false;
    }
  }

  /**
   * Speak text out loud using SpeechSynthesis API
   */
  speak(text, { language = 'hi', rate = 1.0, onEnd } = {}) {
    if (!this.synth || !text) return false;

    // Cancel any previous speaking
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getLanguageLocale(language);
    utterance.rate = Math.min(1.5, Math.max(0.7, rate));
    utterance.pitch = 1.0;

    // Pick best available voice for language if available
    const voices = this.synth.getVoices();
    const targetLang = utterance.lang.toLowerCase();
    const voice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.slice(0, 2)));
    if (voice) {
      utterance.voice = voice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
    return true;
  }

  /**
   * Stop speech synthesis audio playback
   */
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Check if speech synthesis is speaking
   */
  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechAdapter = new SpeechAdapter();

