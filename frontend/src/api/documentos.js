import api from './client';
import { mapAdjunto } from '../utils/adjuntos';

// Adjuntos de solicitud (HU-1.1 sube, HU-3.2 lista y ve).
// El archivo viaja como multipart con los nombres en camelCase porque es lo
// que espera AdjuntoController (@RequestParam).

export const subirAdjunto = ({ solicitudId, archivo, tipoArchivo }) => {
  const form = new FormData();
  form.append('archivo', archivo);
  form.append('solicitudId', String(solicitudId));
  form.append('tipoArchivo', tipoArchivo);
  // El Content-Type por defecto de la instancia es application/json y eso
  // hace que axios serialice el FormData como JSON en vez de multipart. Se
  // declara multipart y el adapter lo borra para que el browser ponga el
  // boundary.
  return api.post('/api/documentos', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const listarAdjuntos = (solicitudId) =>
  api.get(`/api/solicitudes/${solicitudId}/documentos`).then(({ data }) =>
    (Array.isArray(data) ? data : []).map(mapAdjunto),
  );

// El endpoint pide token, asi que el archivo se pide como blob y lo abre la
// vista con un object URL.
export const verAdjunto = (id) =>
  api.get(`/api/documentos/${id}`, { responseType: 'blob' }).then(({ data }) => data);
