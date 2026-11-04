import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client.js';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.getTransactions(params);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'transactions/fetchSummary',
  async ({ period = 'today', language = 'hi' }, { rejectWithValue }) => {
    try {
      const res = await api.getTransactionSummary(period, language);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addTransaction = createAsyncThunk(
  'transactions/add',
  async (txnData, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.createTransaction(txnData);
      // Refresh summary
      dispatch(fetchSummary({ period: 'today' }));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, updates }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.updateTransaction(id, updates);
      dispatch(fetchSummary({ period: 'today' }));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.deleteTransaction(id);
      dispatch(fetchSummary({ period: 'today' }));
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const undoDeleteTransaction = createAsyncThunk(
  'transactions/undoDelete',
  async (item, { rejectWithValue, dispatch }) => {
    try {
      const { _id, ...cleanData } = item;
      const res = await api.createTransaction(cleanData);
      dispatch(fetchSummary({ period: 'today' }));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    period: 'today', // 'today', 'yesterday', 'week', 'month', 'all'
    typeFilter: 'all', // 'all', 'expense', 'income'
    summary: {
      totalExpense: 0,
      totalIncome: 0,
      netBalance: 0,
      speechSummary: '',
      categoryBreakdown: [],
      topCategory: null,
    },
    recentlyDeleted: null,
    isLoading: false,
    isSummaryLoading: false,
    error: null,
  },
  reducers: {
    setPeriodFilter: (state, action) => {
      state.period = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.typeFilter = action.payload;
    },
    clearRecentlyDeleted: (state) => {
      state.recentlyDeleted = null;
    },
    addLocalOptimisticTransaction: (state, action) => {
      state.items.unshift(action.payload);
      if (action.payload.type === 'expense') {
        state.summary.totalExpense += Number(action.payload.amount) || 0;
        state.summary.netBalance -= Number(action.payload.amount) || 0;
      } else {
        state.summary.totalIncome += Number(action.payload.amount) || 0;
        state.summary.netBalance += Number(action.payload.amount) || 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Summary
      .addCase(fetchSummary.pending, (state) => {
        state.isSummaryLoading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.summary = {
          totalExpense: action.payload.totalExpense || 0,
          totalIncome: action.payload.totalIncome || 0,
          netBalance: action.payload.netBalance || 0,
          speechSummary: action.payload.speechSummary || '',
          categoryBreakdown: action.payload.categoryBreakdown || [],
          topCategory: action.payload.topCategory || null,
        };
      })
      .addCase(fetchSummary.rejected, (state) => {
        state.isSummaryLoading = false;
      })
      // Add
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id || (i.offlineId && i.offlineId === action.payload.offlineId));
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.recentlyDeleted = action.payload.data;
        state.items = state.items.filter(i => i._id !== action.payload.id);
      })
      // Undo Delete
      .addCase(undoDeleteTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.recentlyDeleted = null;
      });
  },
});

export const {
  setPeriodFilter,
  setTypeFilter,
  clearRecentlyDeleted,
  addLocalOptimisticTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;

