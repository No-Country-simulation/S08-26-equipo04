import api from './client';

// Notas de una fase de OT (HU-3.3/3.4). El backend las devuelve agrupadas
// por origen en un objeto y siempre incluye las dos claves, aunque esten
// vacias: CALIDAD y JEFE_PRODUCCION (OrigenNota).
export const listarNotasFase = (otFaseId) =>
  api.get(`/api/ot-fases/${otFaseId}/notas`).then(({ data }) => data ?? {});
