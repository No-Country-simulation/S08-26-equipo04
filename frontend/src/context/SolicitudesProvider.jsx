import { useState } from 'react';
import { mocks } from '../mocks';
import { SolicitudesContext } from './SolicitudesContext';

export const SolicitudesProvider = ({ children }) => {
  const [solicitudes, setSolicitudes] = useState(mocks.solicitudes);
  const [adjuntos, setAdjuntos] = useState(mocks.adjuntos);

  const agregarSolicitud = ({ solicitud, archivos }) => {
    const id = Math.max(...solicitudes.map((item) => item.id)) + 1;
    const now = new Date().toISOString();
    const nuevaSolicitud = {
      id,
      numero_solicitud: `SOL-2026-${String(id).padStart(4, '0')}`,
      ...solicitud,
      created_at: now,
      updated_at: now,
    };
    const nuevosAdjuntos = archivos.map((file, index) => ({
      id: Math.max(0, ...adjuntos.map((item) => item.id)) + index + 1,
      solicitud_id: id,
      nombre_original: file.name,
      tipo_archivo: 'OTRO',
      mime_type: file.type || 'application/octet-stream',
      tamanio_bytes: file.size,
      ruta_almacenamiento: `/uploads/solicitudes/${id}/${file.name}`,
      subido_por_id: solicitud.vendedor_id,
      created_at: now,
    }));

    setSolicitudes((prev) => [...prev, nuevaSolicitud]);
    setAdjuntos((prev) => [...prev, ...nuevosAdjuntos]);
    return nuevaSolicitud;
  };

  return (
    <SolicitudesContext.Provider value={{ solicitudes, adjuntos, agregarSolicitud }}>
      {children}
    </SolicitudesContext.Provider>
  );
};