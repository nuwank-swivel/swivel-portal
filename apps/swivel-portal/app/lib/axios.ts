import axios from 'axios';

let idToken: string | null = null;

export function setIdToken(token: string) {
  idToken = token;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
});

api.interceptors.request.use(
  (config) => {
    if (idToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = idToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
