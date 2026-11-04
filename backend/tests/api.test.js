import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { ensureDefaultCategories } from '../src/controllers/categoryController.js';

let server;
let baseUrl;
let token;
let userId;

test.before(async () => {
  await connectDB('mongodb://127.0.0.1:27017/bolkhata_test');
  await ensureDefaultCategories();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (server) server.close();
  if (mongoose.connection) {
    try {
      await mongoose.connection.dropDatabase();
    } catch (_) {}
  }
  await disconnectDB();
});

test('API: Health Check GET /api/health', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.appName, 'BolKhata API');
});

test('API: Register POST /api/auth/register', async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ramesh Kumar',
      identifier: '9876543210',
      password: 'password123',
      preferredLanguage: 'hi'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.ok(data.token);
  token = data.token;
  userId = data.user._id;
});

test('API: Login POST /api/auth/login', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: '9876543210',
      password: 'password123'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.user.name, 'Ramesh Kumar');
});

test('API: Categories GET /api/categories', async () => {
  const res = await fetch(`${baseUrl}/api/categories`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.count > 0);
  assert.ok(data.data.some(c => c.key === 'groceries'));
});

test('API: Create Expense POST /api/transactions', async () => {
  const res = await fetch(`${baseUrl}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'expense',
      amount: 250,
      category: 'groceries',
      categoryName: 'Groceries & Sabzi',
      description: 'Aloo tamatar',
      paymentMethod: 'cash',
      source: 'manual'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.data.amount, 250);
  assert.equal(data.data.type, 'expense');
});

test('API: Create Income POST /api/transactions', async () => {
  const res = await fetch(`${baseUrl}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'income',
      amount: 1500,
      category: 'salary',
      categoryName: 'Salary & Wage',
      description: 'Daily wage payment',
      paymentMethod: 'cash',
      source: 'manual'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.data.amount, 1500);
  assert.equal(data.data.type, 'income');
});

test('API: Transaction Summary GET /api/transactions/summary', async () => {
  const res = await fetch(`${baseUrl}/api/transactions/summary?period=today`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.totalExpense, 250);
  assert.equal(data.totalIncome, 1500);
  assert.equal(data.netBalance, 1250);
  assert.ok(data.speechSummary.length > 0);
});

test('API: Voice Parse POST /api/voice/parse', async () => {
  const res = await fetch(`${baseUrl}/api/voice/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      text: 'Aaj 500 rupaye petrol me dale PhonePe se',
      language: 'hi'
    })
  });

  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.result.data.amount, 500);
  assert.equal(data.result.data.category, 'travel');
  assert.equal(data.result.data.paymentMethod, 'upi');
  assert.ok(data.result.confirmationPrompt);
});

test('API: Planned Expense POST & GET /api/planned-expenses', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const postRes = await fetch(`${baseUrl}/api/planned-expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Bijli Bill',
      amount: 800,
      category: 'bills',
      dueDate: tomorrow.toISOString()
    })
  });

  const postData = await postRes.json();
  assert.equal(postRes.status, 201);
  assert.equal(postData.data.amount, 800);

  const getRes = await fetch(`${baseUrl}/api/planned-expenses?status=pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const getData = await getRes.json();
  assert.equal(getRes.status, 200);
  assert.ok(getData.data.some(p => p.title === 'Bijli Bill'));
});

test('API: Budget POST & GET /api/budgets', async () => {
  const month = new Date().toISOString().slice(0, 7);
  const postRes = await fetch(`${baseUrl}/api/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      month,
      totalBudget: 10000
    })
  });

  const postData = await postRes.json();
  assert.equal(postRes.status, 200);
  assert.equal(postData.data.totalBudget, 10000);

  const getRes = await fetch(`${baseUrl}/api/budgets?month=${month}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const getData = await getRes.json();
  assert.equal(getRes.status, 200);
  assert.equal(getData.data.totalBudget, 10000);
  assert.equal(getData.data.totalSpent, 250);
});

test('API: Export CSV GET /api/export/csv', async () => {
  const res = await fetch(`${baseUrl}/api/export/csv`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');
  const text = await res.text();
  assert.ok(text.includes('Amount (INR)'));
  assert.ok(text.includes('250.00'));
});

test('API: Export PDF GET /api/export/pdf', async () => {
  const res = await fetch(`${baseUrl}/api/export/pdf`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  const buffer = await res.arrayBuffer();
  assert.ok(buffer.byteLength > 100);
});

