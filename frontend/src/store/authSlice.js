import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/client.js';

// Retrieve stored user or language from localStorage
const storedToken = localStorage.getItem('bolkhata_token');
const storedUser = localStorage.getItem('bolkhata_user');
const initialLanguage = localStorage.getItem('bolkhata_lang') || 'hi';

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const res = await api.getMe();
    return res.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.login(credentials);
    if (res.token) {
      localStorage.setItem('bolkhata_token', res.token);
      localStorage.setItem('bolkhata_user', JSON.stringify(res.user));
    }
    return res;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.register(userData);
    if (res.token) {
      localStorage.setItem('bolkhata_token', res.token);
      localStorage.setItem('bolkhata_user', JSON.stringify(res.user));
    }
    return res;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await api.logout();
  } catch (_) {}
  localStorage.removeItem('bolkhata_token');
  localStorage.removeItem('bolkhata_user');
  return null;
});

export const updateUserProfile = createAsyncThunk('auth/updateMe', async (updates, { rejectWithValue }) => {
  try {
    const res = await api.updateMe(updates);
    if (res.user) {
      localStorage.setItem('bolkhata_user', JSON.stringify(res.user));
    }
    return res.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    language: initialLanguage,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
  },
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('bolkhata_lang', action.payload);
      if (state.user) {
        state.user.preferredLanguage = action.payload;
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (action.payload?.preferredLanguage) {
          state.language = action.payload.preferredLanguage;
          localStorage.setItem('bolkhata_lang', action.payload.preferredLanguage);
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (action.payload.user?.preferredLanguage) {
          state.language = action.payload.user.preferredLanguage;
          localStorage.setItem('bolkhata_lang', action.payload.user.preferredLanguage);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (action.payload.user?.preferredLanguage) {
          state.language = action.payload.user.preferredLanguage;
          localStorage.setItem('bolkhata_lang', action.payload.user.preferredLanguage);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Update
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        if (action.payload.preferredLanguage) {
          state.language = action.payload.preferredLanguage;
        }
      });
  },
});

export const { setLanguage, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

