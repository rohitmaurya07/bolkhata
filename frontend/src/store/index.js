import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import transactionReducer from './transactionSlice.js';
import plannedReducer from './plannedSlice.js';
import budgetReducer from './budgetSlice.js';
import uiReducer from './uiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    planned: plannedReducer,
    budget: budgetReducer,
    ui: uiReducer,
  },
});

