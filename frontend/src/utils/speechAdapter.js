/**
 * Robust Modular Speech Recognition and Speech Synthesis Adapter for BolKhata
 */

class SpeechAdapter {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voices = [];

    // Warm up voices when available
    if (this.synth) {
      this.voices = this.synth.getVoices() || [];
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth.getVoices() || [];
        };
      }
    }
  }

  /**
   * Check if browser supports Web Speech Recognition
   */
  get isSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Get SpeechRecognition constructor
   */
  getRecognitionConstructor() {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  /**
   * Map BolKhata language code to BCP-47 locale
   */
  getLanguageLocale(lang) {
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'pa':
        return 'pa-IN'; // Punjabi India (falls back to hi-IN recognition where pa-IN engine is unavailable)
      case 'en':
      default:
        return 'en-IN';
    }
  }

  /**
   * Clean up and abort any currently running recognition instance
   */
  cleanupRecognition() {
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Start listening for voice input.
   * Creates a fresh SpeechRecognition instance on every session to eliminate InvalidStateError.
   */
  startListening({ language = 'hi', onResult, onEnd, onError, onStart }) {
    const SpeechRecognition = this.getRecognitionConstructor();

    if (!SpeechRecognition) {
      if (onError) onError({ error: 'not-supported', message: 'Speech recognition is not supported in this browser.' });
      return { started: false, error: 'not_supported' };
    }

    // Clean up any stale/in-progress instance
    this.cleanupRecognition();

    try {
      const recognition = new SpeechRecognition();
      this.recognition = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = this.getLanguageLocale(language);

      let finalTranscript = '';
      let interimTranscript = '';
      let hasReceivedResult = false;

      recognition.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      recognition.onresult = (event) => {
        hasReceivedResult = true;
        interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (onResult && currentText) {
          onResult({
            transcript: currentText,
            isFinal: !!finalTranscript,
          });
        }
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        console.warn('[BolKhata SpeechAdapter] Recognition error event:', event.error);

        // 'no-speech' is non-fatal: user simply didn't speak in time
        if (event.error === 'no-speech') {
          if (onError) onError({ error: 'no-speech', message: 'No speech was detected. Please tap and speak.' });
          return;
        }

        // 'aborted' happens when stopped by user or restarted
        if (event.error === 'aborted') {
          return;
        }

        if (onError) {
          onError(event);
        }
      };

      recognition.onend = () => {
        this.isListening = false;
        const total = (finalTranscript || interimTranscript).trim();
        if (onEnd) {
          onEnd(total);
        }
      };

      recognition.start();
      return { started: true };
    } catch (err) {
      this.isListening = false;
      console.warn('[BolKhata SpeechAdapter] Exception during recognition.start():', err);

      // If already started or transitioning, try one clean reset
      if (err.name === 'InvalidStateError') {
        this.cleanupRecognition();
      }

      if (onError) onError({ error: err.name || 'start-failed', message: err.message });
      return { started: false, error: err.name || 'failed' };
    }
  }

  /**
   * Stop listening cleanly
   */
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {
        this.cleanupRecognition();
      }
    }
    this.isListening = false;
  }

  /**
   * Speak text out loud using SpeechSynthesis API
   */
  speak(text, { language = 'hi', rate = 1.0, onEnd } = {}) {
    if (!this.synth || !text) return false;

    try {
      // Cancel any currently active speaking
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = this.getLanguageLocale(language);
      utterance.lang = targetLang;
      utterance.rate = Math.min(1.4, Math.max(0.7, rate));
      utterance.pitch = 1.0;

      // Select best matching voice
      const voices = this.voices.length > 0 ? this.voices : (this.synth.getVoices() || []);
      const langPrefix = targetLang.slice(0, 2).toLowerCase();

      const matchingVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.toLowerCase()))
        || voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
        || voices.find(v => v.default);

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.warn('[BolKhata SpeechAdapter] TTS speak error:', err);
      return false;
    }
  }

  /**
   * Stop speech synthesis audio playback
   */
  stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
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
