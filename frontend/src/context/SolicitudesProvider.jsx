import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';
import { useAuth } from './AuthContext';
import { mocks } from '../mocks';
import { SolicitudesContext } from './SolicitudesContext';

// El DTO de lista del backend no trae razon social del cliente ni
// vendedor (solo cliente_id / razon_social cruda). Se enriquece en
// cliente para no romper las vistas hasta que el backend lo incluya.
const mapItem = (item, listaClientes = []) => ({
  ...item,
  cliente_razon_social:
    item.cliente_razon_social ??
    item.razon_social ??
    listaClientes.find((c) => c.id === item.cliente_id)?.razon_social ??
    null,
});

const extractMessage = (error, fallback) => {
  const data = error?.response?.data;
  const mensaje = data?.mensaje || data?.detail || data?.message || data?.error;
  const detalles = Array.isArray(data?.detalles) ? data.detalles.join(' ') : null;
  return [mensaje, detalles].filter(Boolean).join(' ') ||
    (error?.code === 'ECONNABORTED'
      ? 'El servidor tarda en responder (Render en frio). Reintenta.'
      : fallback);
};

export const SolicitudesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // El GET /api/solicitudes solo permite VENDEDOR y JEFE_PRODUCCION: no
  // pedirlo con otros roles para no disparar 403 (toast de permisos).
  const puedeConsultar = user?.rol === 'VENDEDOR' || user?.rol === 'JEFE_PRODUCCION';
  const [solicitudes, setSolicitudes] = useState([]);
  const [clientes, setClientes] = useState([]);
  // Adjuntos 100% locales hasta BE #36 (sin endpoint de documentos).
  const [adjuntos, setAdjuntos] = useState(mocks.adjuntos);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelado = false;
    const promesa = isAuthenticated && puedeConsultar
      ? Promise.all([
        apiGet('/api/solicitudes'),
        // Sin fallback a mock: si clientes falla se muestra el error.
        apiGet('/api/clientes'),
      ])
      : Promise.resolve(null);
    promesa.then(
      (resultado) => {
        if (cancelado) return;
        if (!resultado) {
          setSolicitudes([]);
        } else {
          const [{ data: lista }, { data: listaClientes }] = resultado;
          const listaNormalizada = Array.isArray(listaClientes)
            ? listaClientes
            : undefined;
          setSolicitudes(
            (lista ?? []).map((item) => mapItem(item, listaNormalizada)),
          );
          if (Array.isArray(listaClientes)) setClientes(listaClientes);
        }
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        setError(extractMessage(err, 'No se pudieron cargar las solicitudes.'));
        setCargando(false);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [isAuthenticated, puedeConsultar, version]);

  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    setVersion((v) => v + 1);
  }, []);

  const agregarSolicitud = async ({ solicitud, archivos = [] }) => {
    const base = {
      descripcion_pieza: solicitud.descripcion_pieza,
      cantidad: Number(solicitud.cantidad),
      fecha_esperada_entrega: solicitud.fecha_esperada_entrega || null,
      notas_comerciales: solicitud.notas_comerciales || '',
    };
    const payload = solicitud.cliente_nuevo
      ? { ...base, ...solicitud.cliente_nuevo }
      : { ...base, cliente_id: solicitud.cliente_id };

    try {
      const { data } = await apiPost('/api/solicitudes', payload);
      const now = new Date().toISOString();
      const nueva = mapItem({
        ...solicitud,
        id: data.id,
        numero_solicitud: data.numero_solicitud,
        estado: data.estado,
        created_at: now,
        updated_at: now,
      });
      delete nueva.cliente_nuevo;
      setSolicitudes((prev) => [...prev, nueva]);

      // Metadatos locales hasta BE #36 (el POST no recibe archivos).
      if (archivos.length > 0) {
        setAdjuntos((prev) => {
          const baseId = Math.max(0, ...prev.map((item) => item.id));
          return [
            ...prev,
            ...archivos.map((file, index) => ({
              id: baseId + index + 1,
              solicitud_id: data.id,
              nombre_original: file.name,
              tipo_archivo: 'OTRO',
              mime_type: file.type || 'application/octet-stream',
              tamanio_bytes: file.size,
              ruta_almacenamiento: `/uploads/solicitudes/${data.id}/${file.name}`,
              subido_por_id: solicitud.vendedor_id ?? null,
              created_at: now,
              solo_local: true,
            })),
          ];
        });
      }
      return nueva;
    } catch (err) {
      throw new Error(
        extractMessage(err, 'No se pudo crear la solicitud.'),
        { cause: err },
      );
    }
  };

  const obtenerSolicitud = (id) =>
    solicitudes.find((item) => item.id === Number(id)) ?? null;

  return (
    <SolicitudesContext.Provider
      value={{
        solicitudes,
        clientes,
        adjuntos,
        cargando,
        error,
        recargar,
        agregarSolicitud,
        obtenerSolicitud,
      }}
    >
      {children}
    </SolicitudesContext.Provider>
  );
};
