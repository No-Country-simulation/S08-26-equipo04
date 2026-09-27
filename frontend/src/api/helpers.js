import { format, isValid, parseISO } from 'date-fns';

const normalizeText = (value) => (value == null ? '' : String(value).trim());

export const formatDate = (value, fallback = '—') => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : parseISO(String(value));
  if (!isValid(date)) return fallback;

  return format(date, 'dd/MM/yyyy');
};

export const formatDateTime = (value, fallback = '—') => {
  if (!value) return fallback;

  const date = value instanceof Date ? value : parseISO(String(value));
  if (!isValid(date)) return fallback;

  return format(date, 'dd/MM/yyyy HH:mm');
};

export const formatCodigo = (value, prefix, fallback = '—') => {
  const text = normalizeText(value);
  if (!text) return fallback;

  const upperPrefix = normalizeText(prefix).toUpperCase();
  const candidate = text.toUpperCase();
  if (candidate.startsWith(`${upperPrefix}-`)) return text;

  const rawDigits = text.replace(/\D+/g, '');
  if (!rawDigits) return text;

  return `${upperPrefix}-${rawDigits.padStart(4, '0')}`;
};

export const formatOt = (value, fallback = '—') => formatCodigo(value, 'OT', fallback);
export const formatCot = (value, fallback = '—') => formatCodigo(value, 'COT', fallback);

export const toApiPayload = (data = {}) => {
  const payload = { ...data };

  Object.entries(payload).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) {
      payload[key] = null;
    }
  });

  return payload;
};

// Mensaje de error de una respuesta de la API (el backend responde
// `mensaje`; algunos errores de validacion agregan `detalles`).
export const extractApiMessage = (error, fallback = 'No se pudo completar la solicitud.') => {
  const data = error?.response?.data;
  const mensaje = data?.mensaje || data?.detail || data?.message || data?.error;
  const detalles = Array.isArray(data?.detalles) ? data.detalles.join(' ') : null;

  return [mensaje, detalles].filter(Boolean).join(' ') || fallback;
};
