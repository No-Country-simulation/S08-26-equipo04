import axios from 'axios';
import { toast } from 'sonner';
import { clearSession, readSession } from './session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

api.interceptors.request.use((config) => {
  const session = readSession();
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

    if (status === 401 && !error?.config?.url?.includes('/api/auth/login')) {
      clearSession();
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
