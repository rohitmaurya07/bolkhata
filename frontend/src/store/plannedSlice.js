import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client.js';

export const fetchPlannedExpenses = createAsyncThunk(
  'planned/fetchAll',
  async (status = 'all', { rejectWithValue }) => {
    try {
      const res = await api.getPlannedExpenses(status);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addPlannedExpense = createAsyncThunk(
  'planned/add',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.createPlannedExpense(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markPlannedAsPaid = createAsyncThunk(
  'planned/markPaid',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.updatePlannedExpense(id, {
        status: 'paid',
        createTransactionOnPaid: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePlannedExpense = createAsyncThunk(
  'planned/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.deletePlannedExpense(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const plannedSlice = createSlice({
  name: 'planned',
  initialState: {
    items: [],
    filter: 'pending', // 'pending', 'paid', 'all'
    isLoading: false,
    error: null,
  },
  reducers: {
    setPlannedFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlannedExpenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPlannedExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPlannedExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addPlannedExpense.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(markPlannedAsPaid.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePlannedExpense.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      });
  },
});

export const { setPlannedFilter } = plannedSlice.actions;
export default plannedSlice.reducer;

