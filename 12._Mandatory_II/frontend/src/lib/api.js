export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export function registerUser(email, password) {
  return fetchJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function loginUser(email, password) {
  return fetchJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function logoutUser() {
  return fetchJson('/api/auth/logout', { method: 'POST' });
}

export function fetchSession() {
  return fetchJson('/api/auth/session');
}

export function fetchSecureMessage() {
  return fetchJson('/api/secure/message');
}

export function fetchEvents() {
  return fetchJson('/api/auth/events');
}
