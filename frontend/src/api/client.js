import axios from 'axios';
import { toast } from 'sonner';

const STORAGE_KEY = 'qualitytrack-auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

api.interceptors.request.use((config) => {
  const session = getStoredSession();
  const token = session?.token;

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error?.response;
    const status = response?.status;
    const message = response?.data?.message || response?.data?.error || 'No se pudo completar la solicitud.';

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
      redirectToLogin();
    } else if (status === 403) {
      toast.error('No tienes permisos para esta acción.');
    } else if (status >= 500) {
      toast.error('Error del servidor. Intenta nuevamente.');
    } else if (status === 400 || status === 404 || status === 409) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
