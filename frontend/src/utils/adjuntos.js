// Utilidades del dominio "adjuntos de solicitud" (HU-1.1 / HU-3.2).
// Sin dependencias de red: solo el contrato que comparten el formulario,
// el provider de solicitudes y el modal del operario.

// El backend (spring.servlet.multipart.max-file-size) corta en 10 MB por
// archivo, asi que el limite se valida aca antes de subir nada.
export const MAX_ADJUNTO_BYTES = 10 * 1024 * 1024;

// Valores del enum Adjunto.TipoArchivo del backend.
export const TIPOS_ARCHIVO = [
  { value: 'PLANO', label: 'Plano' },
  { value: 'CERTIFICADO', label: 'Certificado' },
  { value: 'ESPECIFICACION', label: 'Especificación' },
  { value: 'OTRO', label: 'Otro' },
];

export const TIPO_ARCHIVO_POR_DEFECTO = 'OTRO';

export const formatBytes = (bytes) => {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Number((bytes / 1024 / 1024).toFixed(2))} MB`;
};

export const superaTamanioMaximo = (archivo) => archivo.size > MAX_ADJUNTO_BYTES;

export const mensajeTamanioMaximo = (archivo) =>
  `${archivo.name} supera el máximo de ${formatBytes(MAX_ADJUNTO_BYTES)} por archivo. Revisá el tamaño antes de adjuntarlo.`;

// El backend responde AdjuntoResponseDTO en camelCase; el resto de la app
// trabaja en snake_case, asi que se normaliza al entrar (igual que
// mapItem en los otros providers).
export const mapAdjunto = (item) => ({
  id: item.id,
  solicitud_id: item.solicitudId ?? null,
  nombre_original: item.nombreOriginal,
  tipo_archivo: item.tipoArchivo,
  mime_type: item.mimeType,
  tamanio_bytes: item.tamanioBytes,
  ruta_almacenamiento: item.rutaAlmacenamiento,
  subido_por_id: item.subidoPorId ?? null,
  created_at: item.createdAt,
});

// El endpoint que devuelve el archivo responde 404 con un JSON de error,
// pero axios lo entrega como Blob: hay que leerlo para mostrar el mensaje
// real (ej. "El archivo ya no está disponible").
export const mensajeErrorAdjunto = async (error, fallback) => {
  const data = error?.response?.data;
  if (data && typeof data.text === 'function') {
    try {
      const cuerpo = JSON.parse(await data.text());
      return cuerpo?.mensaje || cuerpo?.detail || cuerpo?.message || cuerpo?.error || fallback;
    } catch {
      return fallback;
    }
  }
  return (
    data?.mensaje ||
    data?.detail ||
    data?.message ||
    data?.error ||
    fallback
  );
};
