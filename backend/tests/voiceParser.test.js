import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVoiceInput, extractAmount, extractTransactionType, extractCategory } from '../src/services/voiceParser.js';

test('Voice Parser: "Aaj 200 rupaye sabzi pe kharch kiye"', () => {
  const result = parseVoiceInput('Aaj 200 rupaye sabzi pe kharch kiye');
  assert.equal(result.isValid, true);
  assert.equal(result.isAmbiguous, false);
  assert.equal(result.data.amount, 200);
  assert.equal(result.data.type, 'expense');
  assert.equal(result.data.category, 'groceries');
});

test('Voice Parser: "500 rupees petrol"', () => {
  const result = parseVoiceInput('500 rupees petrol');
  assert.equal(result.isValid, true);
  assert.equal(result.isAmbiguous, false);
  assert.equal(result.data.amount, 500);
  assert.equal(result.data.type, 'expense');
  assert.equal(result.data.category, 'travel');
});

test('Voice Parser: "Received 5000 rupees salary"', () => {
  const result = parseVoiceInput('Received 5000 rupees salary');
  assert.equal(result.isValid, true);
  assert.equal(result.isAmbiguous, false);
  assert.equal(result.data.amount, 5000);
  assert.equal(result.data.type, 'income');
  assert.equal(result.data.category, 'salary');
});

test('Voice Parser: "Kal 1000 rupaye bijli ka bill dena hai"', () => {
  const result = parseVoiceInput('Kal 1000 rupaye bijli ka bill dena hai');
  assert.equal(result.isValid, true);
  assert.equal(result.intent, 'planned_expense');
  assert.equal(result.data.amount, 1000);
  assert.equal(result.data.category, 'bills');
});

test('Voice Parser: "How much did I spend today?" (Query Summary)', () => {
  const result = parseVoiceInput('How much did I spend today?');
  assert.equal(result.isValid, true);
  assert.equal(result.intent, 'query_summary');
  assert.equal(result.period, 'today');
});

test('Voice Parser: "Show my expenses this week" (Query History)', () => {
  const result = parseVoiceInput('Show my expenses this week');
  assert.equal(result.isValid, true);
  assert.equal(result.intent, 'query_history');
  assert.equal(result.period, 'week');
});

test('Voice Parser: Punjabi "Aj 300 rupaye doodh te kharch kitte"', () => {
  const result = parseVoiceInput('Aj 300 rupaye doodh te kharch kitte');
  assert.equal(result.isValid, true);
  assert.equal(result.data.amount, 300);
  assert.equal(result.data.type, 'expense');
  assert.equal(result.data.category, 'groceries');
});

test('Voice Parser: Payment mode extraction "GPay se 250 chai nashta"', () => {
  const result = parseVoiceInput('GPay se 250 chai nashta');
  assert.equal(result.isValid, true);
  assert.equal(result.data.amount, 250);
  assert.equal(result.data.paymentMethod, 'upi');
  assert.equal(result.data.category, 'food');
});

test('Voice Parser: Ambiguous input with no amount should flag isAmbiguous: true', () => {
  const result = parseVoiceInput('Maine chai pi');
  assert.equal(result.isAmbiguous, true);
  assert.equal(result.isValid, false);
});

