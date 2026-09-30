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
    // `silenciarToast: true` pide que la vista maneje el error con su propio
    // mensaje (ej. ErrorBanner en Mis tareas): no se dispara toast global
    // para no duplicar la señal. El 401 igual redirige al login.
    const silenciar = error?.config?.silenciarToast === true;
    if (status === 401 && !error?.config?.url?.includes('/api/auth/login')) {
      clearSession();
      if (!silenciar) {
        toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
      }
      redirectToLogin();
    } else if (!silenciar) {
      if (status === 403) {
        toast.error('No tienes permisos para esta acción.');
      } else if (status >= 500) {
        toast.error('Error del servidor. Intenta nuevamente.');
      } else if ((status === 400 || status === 404 || status === 409) && !esBlob) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
