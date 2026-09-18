import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost, apiPut } from "../api";
import { useAuth } from "./AuthContext";
import { mocks } from "../mocks";
import { CotizacionesContext } from "./CotizacionesContext";

// El DTO de backend trae el nombre de fase como nombre_fase. Se normaliza
// en cliente (precio_final, motivo_rechazo_cliente, fase_nombre) para no
// romper las vistas; si falta el nombre se resuelve contra el catálogo
// local. Se toleran los nombres anteriores por compatibilidad.
const mapFase = (fase, catalogo = mocks.fases) => ({
  ...fase,
  fase_nombre:
    fase.fase_nombre ??
    fase.nombre_fase ??
    catalogo.find((item) => item.id === fase.fase_catalogo_id)?.nombre ??
    null,
});

const mapItem = (item, catalogo = mocks.fases) => ({
  ...item,
  precio_final: item.precio_final ?? item.precio_total ?? null,
  motivo_rechazo_cliente:
    item.motivo_rechazo_cliente ?? item.motivo_rechazo ?? null,
  created_at: item.created_at ?? item.fecha_creacion ?? null,
  updated_at: item.updated_at ?? item.fecha_actualizacion ?? null,
  fases: (item.fases ?? []).map((fase) => mapFase(fase, catalogo)),
});

const extractMessage = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  (error?.code === "ECONNABORTED"
    ? "El servidor tarda en responder (Render en frio). Reintenta."
    : fallback);

const numeroOTDe = (orden) =>
  orden?.numero_ot ?? orden?.numeroOT ?? orden?.numero_o_t ?? null;

export const CotizacionesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // El GET /api/cotizaciones solo permite VENDEDOR y JEFE_PRODUCCION: no
  // pedirlo con otros roles para no disparar 403 (toast de permisos).
  const puedeConsultar =
    user?.rol === "VENDEDOR" || user?.rol === "JEFE_PRODUCCION";
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelado = false;

    const promesa =
      isAuthenticated && puedeConsultar
        ? apiGet("/api/cotizaciones")
        : Promise.resolve(null);
    promesa.then(
      (resultado) => {
        if (cancelado) return;
        setCotizaciones((resultado?.data ?? []).map((item) => mapItem(item)));
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        setError(
          extractMessage(err, "No se pudieron cargar las cotizaciones."),
        );
        setCargando(false);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [isAuthenticated, puedeConsultar, version]);

  const recargar = () => {
    setCargando(true);
    setError(null);
    setVersion((v) => v + 1);
  };

  // Fusiona la respuesta del backend conservando los datos desnormalizados
  // locales (solicitud_numero, cliente) que el DTO no trae.
  const fusionar = (item) => {
    const mapeada = mapItem(item);
    setCotizaciones((prev) =>
      prev.some((c) => c.id === mapeada.id)
        ? prev.map((c) => (c.id === mapeada.id ? { ...c, ...mapeada } : c))
        : [...prev, mapeada],
    );
    return mapeada;
  };

  const agregarCotizacion = async ({
    solicitud_id,
    precio_final,
    fases = [],
    observaciones = "",
    solicitud_numero = null,
    cliente_razon_social = null,
  }) => {
    // fase_nombre e id son solo de UI: el DTO los rechazaría.
    const payload = {
      solicitud_id,
      precio_final: Number(precio_final),
      observaciones: observaciones || "",
      fases: fases.map((fase, index) => ({
        fase_catalogo_id: fase.fase_catalogo_id,
        numero_secuencia: fase.numero_secuencia ?? index + 1,
        tiempo_estimado_minutos: Number(fase.tiempo_estimado_minutos),
        instrucciones_fase: fase.instrucciones_fase || "",
      })),
    };
    try {
      const { data } = await apiPost("/api/cotizaciones", payload);
      const creada = {
        ...mapItem(data),
        solicitud_numero,
        cliente_razon_social,
      };
      setCotizaciones((prev) => [...prev, creada]);
      return creada;
    } catch (err) {
      throw new Error(extractMessage(err, "No se pudo crear la cotización."), {
        cause: err,
      });
    }
  };

  // Sin endpoint de edición en backend: la edición de una cotización
  // LISTA_PARA_ENVIAR queda solo en estado local hasta que BE lo agregue.
  const actualizarCotizacion = (id, datos) => {
    setCotizaciones((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...datos, updated_at: new Date().toISOString() }
          : c,
      ),
    );
  };

  const enviarCotizacion = async (id) => {
    try {
      const { data } = await apiPut(`/api/cotizaciones/${id}`, {});
      return fusionar(data);
    } catch (err) {
      throw new Error(extractMessage(err, "No se pudo enviar la cotización."), {
        cause: err,
      });
    }
  };

  const aprobarCotizacion = async (id) => {
    let data;
    try {
      ({ data } = await apiPost(`/api/cotizaciones/${id}/aprobar`, {}));
    } catch (err) {
      throw new Error(
        extractMessage(err, "No se pudo aprobar la cotización."),
        { cause: err },
      );
    }
    const cotizacion = fusionar(data);
    // La OT la genera el backend al aprobar: se verifica que exista.
    let ordenTrabajo;
    try {
      ({ data: ordenTrabajo } = await apiGet(
        `/api/ordenes-trabajo/cotizacion/${id}`,
      ));
    } catch {
      ordenTrabajo = null;
    }
    return { cotizacion, ordenTrabajo, numeroOT: numeroOTDe(ordenTrabajo) };
  };

  const rechazarCotizacion = async (id, motivo) => {
    try {
      const { data } = await apiPost(`/api/cotizaciones/${id}/rechazar`, {
        motivo_rechazo_cliente: motivo,
      });
      return fusionar(data);
    } catch (err) {
      throw new Error(
        extractMessage(err, "No se pudo rechazar la cotización."),
        { cause: err },
      );
    }
  };

  const obtenerCotizacion = (id) =>
    cotizaciones.find((item) => item.id === Number(id)) ?? null;

  // Las transicionadas (ENVIADA/APROBADA/...) no vienen en el listado de
  // pendientes: se busca por id como fallback (p. ej. recarga del detalle).
  const cargarCotizacion = useCallback(async (id) => {
    const { data } = await apiGet(`/api/cotizaciones/${id}`);
    const mapeada = mapItem(data);
    setCotizaciones((prev) =>
      prev.some((c) => c.id === mapeada.id)
        ? prev.map((c) => (c.id === mapeada.id ? { ...c, ...mapeada } : c))
        : [...prev, mapeada],
    );
    return mapeada;
  }, []);

  return (
    <CotizacionesContext.Provider
      value={{
        cotizaciones,
        cargando,
        error,
        recargar,
        agregarCotizacion,
        actualizarCotizacion,
        enviarCotizacion,
        aprobarCotizacion,
        rechazarCotizacion,
        obtenerCotizacion,
        cargarCotizacion,
      }}
    >
      {children}
    </CotizacionesContext.Provider>
  );
};
