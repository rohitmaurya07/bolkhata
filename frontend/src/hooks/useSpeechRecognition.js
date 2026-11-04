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
        if (summaryRes?.speechSummary) {
          speak(summaryRes.speechSummary, language);
        }
        dispatch(closeVoiceModal());
        navigate('/summary');
        return;
      }

      if (result.intent === 'query_history') {
        dispatch(closeVoiceModal());
        navigate('/history');
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

      // Play audio prompt if prompt text exists
      if (result.confirmationPrompt) {
        speak(result.confirmationPrompt, language);
      }
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

    const started = speechAdapter.startListening({
      language,
      onStart: () => setIsListening(true),
      onResult: ({ transcript: text, isFinal }) => {
        setTranscript(text);
        if (isFinal) {
          finalTranscriptRef.current = text;
        }
      },
      onEnd: () => {
        setIsListening(false);
        const textToProcess = finalTranscriptRef.current || transcript;
        if (textToProcess && textToProcess.trim()) {
          processVoiceText(textToProcess);
        }
      },
      onError: (err) => {
        setIsListening(false);
        const msg = err.error === 'not-allowed'
          ? 'Microphone permission denied. Please allow microphone access or use manual entry.'
          : 'Microphone was not able to detect sound. Please try again.';
        setErrorMessage(msg);
      },
    });

    if (!started) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use manual entry.');
    }
  }, [language, processVoiceText, transcript]);

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

