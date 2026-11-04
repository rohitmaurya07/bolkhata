import { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { speechAdapter } from '../utils/speechAdapter.js';
import { api } from '../api/client.js';
import { openConfirmationModal, closeVoiceModal } from '../store/uiSlice.js';
import { fetchSummary } from '../store/transactionSlice.js';
import { useSpeechSynthesis } from './useSpeechSynthesis.js';

export function useSpeechRecognition() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { speak } = useSpeechSynthesis();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const finalTranscriptRef = useRef('');

  const processVoiceText = useCallback(async (textToParse) => {
    if (!textToParse || !textToParse.trim()) return;

    setIsParsing(true);
    setErrorMessage('');

    try {
      const res = await api.parseVoice(textToParse, language);
      const { result } = res;

      // Handle queries (e.g. "How much did I spend today?" or "Show my expenses")
      if (result.intent === 'query_summary') {
        const period = result.period || 'today';
        const summaryRes = await dispatch(fetchSummary({ period, language })).unwrap();
        dispatch(closeVoiceModal());
        navigate('/summary');

        // Repeat the user's spoken question followed by the summary
        let querySpeech = '';
        if (language === 'hi') {
          querySpeech = `आपने पूछा: "${textToParse}"। ${summaryRes?.speechSummary || ''}`;
        } else if (language === 'pa') {
          querySpeech = `ਤੁਸੀਂ ਪੁੱਛਿਆ: "${textToParse}"। ${summaryRes?.speechSummary || ''}`;
        } else {
          querySpeech = `You asked: "${textToParse}". ${summaryRes?.speechSummary || ''}`;
        }
        speak(querySpeech, language);
        return;
      }

      if (result.intent === 'query_history') {
        dispatch(closeVoiceModal());
        navigate('/history');

        let historySpeech = '';
        if (language === 'hi') {
          historySpeech = `आपने कहा: "${textToParse}"। लेनदेन का इतिहास दिखाया जा रहा है।`;
        } else if (language === 'pa') {
          historySpeech = `ਤੁਸੀਂ ਕਿਹਾ: "${textToParse}"। ਲੈਣ-ਦੇਣ ਦਾ ਇਤਿਹਾਸ ਦਿਖਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।`;
        } else {
          historySpeech = `You said: "${textToParse}". Showing transaction history.`;
        }
        speak(historySpeech, language);
        return;
      }

      // It's a transaction or planned expense
      // Open the Confirmation Modal with large, clear financial details
      // Never automatically save without explicit user confirmation!
      dispatch(
        openConfirmationModal({
          data: result.data,
          rawVoiceText: textToParse,
          confirmationPrompt: result.confirmationPrompt,
          isAmbiguous: result.isAmbiguous,
        })
      );

      // Speak back the user's exact spoken words repeated by TTS, followed by confirmation prompt
      let spokenConfirmation = '';
      if (language === 'hi') {
        spokenConfirmation = `आपने कहा: "${textToParse}"। ${result.confirmationPrompt || ''}`;
      } else if (language === 'pa') {
        spokenConfirmation = `ਤੁਸੀਂ ਕਿਹਾ: "${textToParse}"। ${result.confirmationPrompt || ''}`;
      } else {
        spokenConfirmation = `You said: "${textToParse}". ${result.confirmationPrompt || ''}`;
      }

      speak(spokenConfirmation, language);
    } catch (err) {
      console.error('[BolKhata Voice] Parse error:', err);
      setErrorMessage(err.message || 'Could not understand voice input. Please try again.');
    } finally {
      setIsParsing(false);
    }
  }, [dispatch, language, navigate, speak]);

  const startListening = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    setErrorMessage('');

    // Check actual browser capability
    if (!speechAdapter.isSupported) {
      setErrorMessage(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है। कृपया लिखकर दर्ज करें।'
          : language === 'pa'
          ? 'ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਆਵਾਜ਼ ਪਛਾਣ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਲਿਖ ਕੇ ਦਰਜ ਕਰੋ।'
          : 'Speech recognition is not supported in this browser. Please use manual entry.'
      );
      return;
    }

    const res = speechAdapter.startListening({
      language,
      onStart: () => {
        setIsListening(true);
        setErrorMessage('');
      },
      onResult: ({ transcript: text, isFinal }) => {
        setTranscript(text);
        if (isFinal) {
          finalTranscriptRef.current = text;
        }
      },
      onEnd: (totalTranscript) => {
        setIsListening(false);
        const textToProcess = totalTranscript || finalTranscriptRef.current;
        if (textToProcess && textToProcess.trim()) {
          processVoiceText(textToProcess);
        }
      },
      onError: (err) => {
        setIsListening(false);
        if (err.error === 'no-speech') {
          setErrorMessage(
            language === 'hi'
              ? 'आवाज़ सुनाई नहीं दी। कृपया माइक बटन दबाकर दोबारा बोलें।'
              : language === 'pa'
              ? 'ਕੋਈ ਆਵਾਜ਼ ਨਹੀਂ ਆਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ।'
              : 'No speech detected. Please tap the mic and speak clearly.'
          );
        } else if (err.error === 'not-allowed') {
          setErrorMessage(
            language === 'hi'
              ? 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।'
              : 'Microphone permission denied. Please allow microphone access in your browser.'
          );
        } else if (err.error === 'audio-capture') {
          setErrorMessage('No microphone found or microphone is busy.');
        } else {
          setErrorMessage('Microphone temporarily busy. Please tap mic again to speak.');
        }
      },
    });

    if (!res.started && res.error === 'not_supported') {
      setErrorMessage(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है। कृपया लिखकर दर्ज करें।'
          : 'Speech recognition is not supported in this browser. Please use manual entry.'
      );
    }
  }, [language, processVoiceText]);

  const stopListening = useCallback(() => {
    speechAdapter.stopListening();
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    isParsing,
    errorMessage,
    isSupported: speechAdapter.isSupported,
    startListening,
    stopListening,
    processVoiceText,
  };
}
