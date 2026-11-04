import { saveOfflineTransaction, getCachedTransactions, cacheTransactions } from '../utils/db.js';

const API_BASE =  import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('bolkhata_token');
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // sends HTTP-only cookie
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // If unauthorized, clean up expired state
    if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      localStorage.removeItem('bolkhata_token');
      localStorage.removeItem('bolkhata_user');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    // If network error (offline) and this is a transaction creation, store to offline IndexedDB
    if (!navigator.onLine || err.message.includes('Failed to fetch') || err.name === 'TypeError') {
      console.warn('[BolKhata API] Network unavailable, attempting offline handling for:', endpoint);
      if (endpoint === '/transactions' && options.method === 'POST') {
        const payload = JSON.parse(options.body || '{}');
        const offlineRecord = await saveOfflineTransaction(payload);
        return {
          success: true,
          data: offlineRecord,
          isOffline: true,
          message: 'Saved offline on your device',
        };
      }
      if (endpoint.startsWith('/transactions') && options.method === 'GET') {
        const cached = await getCachedTransactions();
        return {
          success: true,
          data: cached,
          isOffline: true,
          count: cached.length,
        };
      }
    }
    throw err;
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),

  // Transactions
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/transactions?${query}`);
    if (data.success && Array.isArray(data.data)) {
      cacheTransactions(data.data).catch(() => {});
    }
    return data;
  },
  getTransactionSummary: (period = 'today', language, startDate, endDate) => {
    const params = new URLSearchParams({ period });
    if (language) params.append('language', language);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request(`/transactions/summary?${params.toString()}`);
  },
  createTransaction: (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id, body) => request(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  syncOfflineTransactions: (items) => request('/transactions/sync', { method: 'POST', body: JSON.stringify({ items }) }),

  // Voice
  parseVoice: (text, language) => request('/voice/parse', { method: 'POST', body: JSON.stringify({ text, language }) }),

  // Planned Expenses
  getPlannedExpenses: (status) => request(`/planned-expenses${status ? `?status=${status}` : ''}`),
  createPlannedExpense: (body) => request('/planned-expenses', { method: 'POST', body: JSON.stringify(body) }),
  updatePlannedExpense: (id, body) => request(`/planned-expenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletePlannedExpense: (id) => request(`/planned-expenses/${id}`, { method: 'DELETE' }),

  // Budgets
  getBudget: (month) => request(`/budgets${month ? `?month=${month}` : ''}`),
  setBudget: (body) => request('/budgets', { method: 'POST', body: JSON.stringify(body) }),
  updateBudget: (id, body) => request(`/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Categories
  getCategories: (type) => request(`/categories${type ? `?type=${type}` : ''}`),
  createCategory: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),

  // Export URLs
  getCSVUrl: (period, startDate, endDate) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${API_BASE}/export/csv?${params.toString()}`;
  },
  getPDFUrl: (period, startDate, endDate) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${API_BASE}/export/pdf?${params.toString()}`;
  },
};

