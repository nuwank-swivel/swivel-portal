import axios from 'axios';
import { Logger } from './logger';

let idToken: string | null = null;

export function setIdToken(token: string) {
  idToken = token;
  localStorage.setItem('token', token);
}

function getIdToken() {
  if (!idToken) {
    idToken = localStorage.getItem('token');
  }
  return idToken;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
});

api.interceptors.request.use(
  (config) => {
    const token = getIdToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = idToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    Logger.error('[api] HTTP request failed', {
      method: error?.config?.method,
      url: error?.config?.url,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      error,
    });
    return Promise.reject(error);
  }
);

export default api;
