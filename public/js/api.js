// API Client - All backend API calls
const api = {
  async request(url, options = {}) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        ...options,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  checkAuth() {
    return this.request('/api/me');
  },

  login(username, password) {
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register(username, password) {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  logout() {
    return this.request('/api/logout', { method: 'POST' });
  },

  getTransactions(year, month) {
    return this.request(`/api/transactions?year=${year}&month=${month}`);
  },

  addTransaction(data) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTransaction(id, data) {
    return this.request(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTransaction(id) {
    return this.request(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  getWisdom() {
    return this.request('/api/wisdom');
  },
};

export default api;
