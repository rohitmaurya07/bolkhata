import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client.js';

export const fetchBudget = createAsyncThunk(
  'budget/fetch',
  async (month, { rejectWithValue }) => {
    try {
      const res = await api.getBudget(month);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveBudget = createAsyncThunk(
  'budget/save',
  async ({ month, totalBudget, categoryBudgets }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.setBudget({ month, totalBudget, categoryBudgets });
      dispatch(fetchBudget(month));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState: {
    data: {
      budget: null,
      month: new Date().toISOString().slice(0, 7),
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      percentageUsed: 0,
      isOverBudget: false,
      overBudgetAmount: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default budgetSlice.reducer;

