import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { PlannedExpense } from '../models/PlannedExpense.js';
import { Budget } from '../models/Budget.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { ensureDefaultCategories } from '../controllers/categoryController.js';

export async function seedDemoData() {
  await ensureDefaultCategories();

  // Check if demo user already exists
  let user = await User.findOne({ identifier: 'demo@bolkhata.com' });
  if (!user) {
    user = await User.create({
      name: 'Ramesh Kumar',
      identifier: 'demo@bolkhata.com',
      password: 'password123',
      preferredLanguage: 'hi',
      currency: 'INR',
      currencySymbol: '₹',
      voiceSpeed: 1.0,
      autoPlaySpeech: true,
    });
    console.log('[Seed] Created demo user: demo@bolkhata.com / password123');
  }

  // Transactions
  const txnCount = await Transaction.countDocuments({ user: user._id });
  if (txnCount === 0) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Transaction.create([
      {
        user: user._id,
        type: 'expense',
        amount: 200,
        category: 'groceries',
        categoryName: 'Groceries & Sabzi',
        categoryIcon: 'ShoppingBag',
        description: 'Aloo pyaz tamatar',
        date: today,
        paymentMethod: 'cash',
        source: 'voice',
        rawVoiceText: 'Aaj 200 rupaye sabzi pe kharch kiye',
      },
      {
        user: user._id,
        type: 'expense',
        amount: 500,
        category: 'travel',
        categoryName: 'Petrol & Travel',
        categoryIcon: 'Fuel',
        description: 'Bike petrol',
        date: today,
        paymentMethod: 'upi',
        source: 'voice',
        rawVoiceText: '500 rupees petrol',
      },
      {
        user: user._id,
        type: 'income',
        amount: 5000,
        category: 'salary',
        categoryName: 'Salary & Wage',
        categoryIcon: 'Briefcase',
        description: 'Advance salary received',
        date: today,
        paymentMethod: 'bank',
        source: 'voice',
        rawVoiceText: 'Received 5000 rupees salary',
      },
      {
        user: user._id,
        type: 'expense',
        amount: 80,
        category: 'food',
        categoryName: 'Food & Chai',
        categoryIcon: 'Utensils',
        description: 'Morning chai and biscuit',
        date: yesterday,
        paymentMethod: 'cash',
        source: 'manual',
      },
    ]);
    console.log('[Seed] Seeded realistic transactions.');
  }

  // Planned Expenses
  const plannedCount = await PlannedExpense.countDocuments({ user: user._id });
  if (plannedCount === 0) {
    const billDate = new Date();
    billDate.setDate(billDate.getDate() + 2);

    await PlannedExpense.create([
      {
        user: user._id,
        title: 'Bijli ka bill',
        amount: 1000,
        category: 'bills',
        dueDate: billDate,
        status: 'pending',
        paymentMethod: 'upi',
        notes: 'Kal 1000 rupaye bijli ka bill dena hai',
      },
      {
        user: user._id,
        title: 'Room Kiraya (Rent)',
        amount: 4500,
        category: 'bills',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        paymentMethod: 'cash',
        notes: 'Monthly room rent to landlord',
      },
    ]);
    console.log('[Seed] Seeded planned expenses.');
  }

  // Budget
  const currentMonth = new Date().toISOString().slice(0, 7);
  const existingBudget = await Budget.findOne({ user: user._id, month: currentMonth });
  if (!existingBudget) {
    await Budget.create({
      user: user._id,
      month: currentMonth,
      totalBudget: 15000,
      categoryBudgets: [
        { category: 'groceries', amount: 5000 },
        { category: 'travel', amount: 3000 },
        { category: 'food', amount: 2000 },
        { category: 'bills', amount: 4000 },
      ],
    });
    console.log('[Seed] Seeded monthly budget.');
  }

  return user;
}

if (process.argv[1]?.endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    await seedDemoData();
    await disconnectDB();
    console.log('Seeding completed successfully.');
    process.exit(0);
  })();
}

