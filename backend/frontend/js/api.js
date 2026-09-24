const API_BASE = (() => {
  const base = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  return base + '/api';
})();

const api = {
  async request(method, endpoint, data = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data && method !== 'GET') opts.body = JSON.stringify(data);
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    return res.json();
  },

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, data) { return this.request('POST', endpoint, data); },
  put(endpoint, data) { return this.request('PUT', endpoint, data); },
  delete(endpoint) { return this.request('DELETE', endpoint); },

  async uploadFile(endpoint, file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', body: form });
    return res.json();
  },
};