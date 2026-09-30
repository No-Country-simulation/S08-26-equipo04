import axios from 'axios';
import { toast } from 'sonner';
import { extractApiMessage } from './helpers';
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
    const message = extractApiMessage(error);
    // En las respuestas blob (ver documento) el cuerpo no es un objeto y la
    // vista responsable muestra su propio mensaje: no se duplica el toast.
    const esBlob = error?.config?.responseType === 'blob';
    // Hay 404 esperados (ej. OT sin auditorías en el expediente): la vista
    // los maneja y pide silencio con `silenciarToast: true` en el config.
    // Solo se salta ese 404 puntual: 401/403/500 siguen el flujo global.
    if (status === 404 && error?.config?.silenciarToast === true) {
      return Promise.reject(error);
    }
    if (status === 401 && !error?.config?.url?.includes('/api/auth/login')) {
      clearSession();
      toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
      redirectToLogin();
    } else if (status === 403) {
      toast.error('No tienes permisos para esta acción.');
    } else if (status >= 500) {
      toast.error('Error del servidor. Intenta nuevamente.');
    } else if ((status === 400 || status === 404 || status === 409) && !esBlob) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
