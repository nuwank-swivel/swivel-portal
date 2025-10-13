import axios from 'axios';

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

export default api;
