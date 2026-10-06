const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://ogmedia-6uxn.onrender.com' : 'http://localhost:4000');

const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

class ApiClient {
  constructor() {
    this.accessToken = localStorage.getItem('og_access_token') || null;
  }

  setToken(token) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('og_access_token', token);
    } else {
      localStorage.removeItem('og_access_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });

      if (response.status === 401 && !options._retry && endpoint !== '/api/v1/auth/login' && endpoint !== '/api/v1/auth/refresh') {
        options._retry = true;
        const refreshed = await this.refreshToken();
        if (refreshed) {
          headers.Authorization = `Bearer ${this.accessToken}`;
          return fetch(url, { ...options, headers, credentials: 'include' }).then((r) => r.json());
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.error?.message || `Request failed with status ${response.status}`);
        error.code = data.error?.code || 'API_ERROR';
        error.status = response.status;
        error.details = data.error?.details;
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async refreshToken() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.accessToken) {
          this.setToken(data.data.accessToken);
          return true;
        }
      }
    } catch {

    }
    this.setToken(null);
    return false;
  }

  login(login, password) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
  }

  logout() {
    return this.request('/api/v1/auth/logout', { method: 'POST' });
  }

  getMe() {
    return this.request('/api/v1/auth/me');
  }

  changePassword(currentPassword, newPassword) {
    return this.request('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  submitPublicLead(leadData) {
    return this.request('/api/v1/public/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  getLeads(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    return this.request(`/api/v1/leads?${query.toString()}`);
  }

  getLeadById(id) {
    return this.request(`/api/v1/leads/${id}`);
  }

  updateLead(id, data) {
    return this.request(`/api/v1/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  updateLeadStatus(id, status, note) {
    return this.request(`/api/v1/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
  }

  addLeadNote(id, text) {
    return this.request(`/api/v1/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  assignLead(id, employeeId) {
    return this.request(`/api/v1/leads/${id}/assignment`, {
      method: 'PATCH',
      body: JSON.stringify({ employeeId })
    });
  }

  getEmployees(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return this.request(`/api/v1/employees?${query.toString()}`);
  }

  createEmployee(employeeData) {
    return this.request('/api/v1/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  }

  getEmployeeById(id) {
    return this.request(`/api/v1/employees/${id}`);
  }

  updateEmployee(id, data) {
    return this.request(`/api/v1/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  resetEmployeePassword(id) {
    return this.request(`/api/v1/employees/${id}/reset-password`, {
      method: 'POST'
    });
  }

  suggestUsername(name = '', email = '') {
    const query = new URLSearchParams();
    if (name) query.append('name', name);
    if (email) query.append('email', email);
    return this.request(`/api/v1/employees/suggest-username?${query.toString()}`);
  }

  getOverviewAnalytics(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return this.request(`/api/v1/analytics/overview?${query.toString()}`);
  }

  getServiceAnalytics() {
    return this.request('/api/v1/analytics/services');
  }

  getTimelineAnalytics(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return this.request(`/api/v1/analytics/timeline?${query.toString()}`);
  }

  getEmployeeAnalytics() {
    return this.request('/api/v1/analytics/employees');
  }

  getAuditLogs(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return this.request(`/api/v1/audit-logs?${query.toString()}`);
  }

  getSystemHealth() {
    return this.request('/api/v1/system/health');
  }

  clearSystemErrors() {
    return this.request('/api/v1/system/errors', { method: 'DELETE' });
  }

  triggerTestError() {
    return this.request('/api/v1/system/test-error', { method: 'POST' });
  }
}

export const api = new ApiClient();
