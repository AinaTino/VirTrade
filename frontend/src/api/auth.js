import api from './axiosClient.js';

export async function login({ email, password }) {
  if (import.meta.env.DEV) {
    return { token: 'mock-token', user: { id: 1, email } };
  }
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function register({ email, password }) {
  if (import.meta.env.DEV) {
    return { token: 'mock-token', user: { id: 1, email } };
  }
  const response = await api.post('/auth/register', { email, password });
  return response.data;
}
