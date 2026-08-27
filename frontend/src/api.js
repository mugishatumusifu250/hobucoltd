const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiCall = async (url, options = {}) => {
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(`${API_BASE}${url}`, config);
  return res;
};

export const authAPI = {
  signup: (data) => apiCall('/auth/signup', { method: 'POST', body: data }),
  login: (data) => apiCall('/auth/login', { method: 'POST', body: data }),
  forgot: (data) => apiCall('/auth/forgot', { method: 'POST', body: data }),
  verifyCode: (data) => apiCall('/auth/verify-code', { method: 'POST', body: data }),
  resetPassword: (data) => apiCall('/auth/reset-password', { method: 'POST', body: data }),
  me: () => apiCall('/auth/me'),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
};

export const consultationsAPI = {
  getAll: () => apiCall('/consultations/'),
  getById: (id) => apiCall(`/consultations/${id}`),
  book: (data) => apiCall('/consultations/', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/consultations/update/${id}`, { method: 'POST', body: data }),
  delete: (id) => apiCall(`/consultations/delete/${id}`, { method: 'DELETE' }),
  search: (query) => apiCall(`/consultations/search?query=${encodeURIComponent(query)}`),
  exportExcel: () => `${API_BASE}/consultations/export`,
};

export const usersAPI = {
  getAll: () => apiCall('/users/'),
  getById: (id) => apiCall(`/users/${id}`),
  update: (id, data) => apiCall(`/users/update/${id}`, { method: 'POST', body: data }),
  delete: (id) => apiCall(`/users/delete/${id}`, { method: 'DELETE' }),
  search: (query) => apiCall(`/users/search?query=${encodeURIComponent(query)}`),
  exportExcel: (role) => `${API_BASE}/users/export/${role}`,
};

export const requestsAPI = {
  getAll: () => apiCall('/requests/'),
  action: (id, action) =>
    apiCall(`/requests/action/${id}`, { method: 'POST', body: { action } }),
};

export default apiCall;
