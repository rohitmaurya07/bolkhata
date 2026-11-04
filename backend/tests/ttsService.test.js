import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSummarySpeech } from '../src/services/ttsService.js';

test('TTS Service: Generates natural Hindi speech summary', () => {
  const speech = generateSummarySpeech({
    period: 'today',
    totalExpense: 350,
    totalIncome: 1000,
    netBalance: 650,
    topCategory: { name: 'सब्ज़ी और राशन', amount: 200 },
    transactionCount: 2,
    language: 'hi'
  });

  assert.ok(speech.includes('आज आपने 350 रुपये खर्च किए'));
  assert.ok(speech.includes('1000 रुपये की आमदनी हुई'));
  assert.ok(speech.includes('बचत 650 रुपये है'));
});

test('TTS Service: Generates natural Punjabi speech summary', () => {
  const speech = generateSummarySpeech({
    period: 'today',
    totalExpense: 500,
    totalIncome: 0,
    netBalance: -500,
    topCategory: { name: 'ਪੈਟਰੋਲ', amount: 500 },
    transactionCount: 1,
    language: 'pa'
  });

  assert.ok(speech.includes('ਅੱਜ ਤੁਸੀਂ 500 ਰੁਪਏ ਖਰਚ ਕੀਤੇ'));
  assert.ok(speech.includes('ਪੈਟਰੋਲ'));
});

test('TTS Service: Generates natural English speech summary', () => {
  const speech = generateSummarySpeech({
    period: 'today',
    totalExpense: 200,
    totalIncome: 500,
    netBalance: 300,
    transactionCount: 1,
    language: 'en'
  });

  assert.ok(speech.includes('Today, you spent ₹200'));
  assert.ok(speech.includes('received ₹500'));
});

