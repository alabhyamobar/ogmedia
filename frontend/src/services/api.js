const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
        credentials: 'include' // Sends HTTP-only refresh cookies
      });

      // Handle 401 Unauthorized -> try refresh token once
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
      // Refresh failed
    }
    this.setToken(null);
    return false;
  }

  // --- Auth APIs ---
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

  // --- Public APIs ---
  submitPublicLead(leadData) {
    return this.request('/api/v1/public/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  // --- Lead APIs ---
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

  // --- Employee APIs ---
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

  // --- Analytics APIs ---
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

  getEmployeeAnalytics() {
    return this.request('/api/v1/analytics/employees');
  }

  // --- Audit Logs ---
  getAuditLogs(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return this.request(`/api/v1/audit-logs?${query.toString()}`);
  }

  // --- System Health ---
  getSystemHealth() {
    return this.request('/api/v1/system/health');
  }
}

export const api = new ApiClient();
