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

// Varios providers piden en paralelo al abrir una vista: si todos fallan con
// el mismo motivo (ej. sesión inválida tras un reset de BD), no se apila un
// toast por request. Misma señal dentro de la ventana => solo el primero.
let ultimoToast = { mensaje: null, momento: 0 };
const VENTANA_DEDUPE_MS = 3000;
const toastUnico = (mensaje) => {
  const ahora = Date.now();
  if (
    mensaje &&
    (mensaje !== ultimoToast.mensaje ||
      ahora - ultimoToast.momento > VENTANA_DEDUPE_MS)
  ) {
    ultimoToast = { mensaje, momento: ahora };
    toast.error(mensaje);
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
        toastUnico('Tu sesión expiró. Inicia sesión nuevamente.');
      }
      redirectToLogin();
    } else if (!silenciar) {
      if (status === 403) {
        toastUnico('No tienes permisos para esta acción.');
      } else if (status >= 500) {
        toastUnico('Error del servidor. Intenta nuevamente.');
      } else if ((status === 400 || status === 404 || status === 409) && !esBlob) {
        toastUnico(message);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
