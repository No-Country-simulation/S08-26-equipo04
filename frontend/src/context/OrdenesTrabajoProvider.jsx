import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import { useAuth } from "./AuthContext";
import { OrdenesTrabajoContext } from "./OrdenesTrabajoContext";

const mapItem = (item) => ({
  ...item,
  numero_ot: item.numero_ot ?? item.numeroOT ?? item.numero_o_t ?? "OT-—",
  cliente_razon_social: item.cliente_razon_social ?? item.cliente ?? "—",
  descripcion_pieza: item.descripcion_pieza ?? item.pieza_trabajo ?? "—",
  receptor_nombre: item.receptor_nombre ?? item.receptorNombre ?? null,
  fecha_entrega:
    item.fecha_entrega ??
    item.fechaEntrega ??
    item.fecha_termino_real ??
    item.fechaTerminoReal ??
    null,
  // El DTO de OT manda fecha_creacion/fecha_actualizacion, no created_at.
  created_at:
    item.created_at ??
    item.createdAt ??
    item.fecha_creacion ??
    item.fechaCreacion ??
    null,
  updated_at:
    item.updated_at ??
    item.updatedAt ??
    item.fecha_actualizacion ??
    item.fechaActualizacion ??
    null,
});

export const OrdenesTrabajoProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const puedeConsultar =
    user?.rol === "VENDEDOR" || user?.rol === "JEFE_PRODUCCION";

  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);

  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      if (!isAuthenticated || !puedeConsultar) {
        setOrdenesTrabajo([]);
        setCargando(false);
        return;
      }

      setCargando(true);
      try {
        let ordenes = [];
        if (user?.rol === "VENDEDOR") {
          const { data: cotizaciones } = await apiGet("/api/cotizaciones");
          const aprobadas = (cotizaciones ?? []).filter(
            (cotizacion) => cotizacion.estado === "APROBADA",
          );
          const respuestas = await Promise.all(
            aprobadas.map((cotizacion) =>
              apiGet(`/api/ordenes-trabajo/cotizacion/${cotizacion.id}`).catch(() => null),
            ),
          );
          const cotizacionesPorId = new Map(
            aprobadas.map((cotizacion) => [cotizacion.id, cotizacion]),
          );
          ordenes = respuestas
            .filter(Boolean)
            .map(({ data }) => {
              const cotizacion = cotizacionesPorId.get(
                data.cotizacionId ?? data.cotizacion_id,
              );
              return {
                ...data,
                cliente_razon_social:
                  cotizacion?.cliente_razon_social ?? data.cliente ?? "—",
                descripcion_pieza:
                  cotizacion?.descripcion_pieza ?? data.pieza_trabajo ?? "—",
                cantidad: cotizacion?.cantidad ?? data.cantidad ?? "—",
                fecha_esperada_entrega:
                  cotizacion?.fecha_esperada_entrega ??
                  data.fecha_esperada_entrega ??
                  null,
              };
            });
        } else {
          const estados = [
            "EN_PRODUCCION",
            "EN_CALIDAD",
            "NO_CONFORME",
            "DESPACHO",
            "ENTREGADA",
          ];
          // El DTO de OT no trae cliente: se enriquece con las cotizaciones
          // (el Jefe tiene permiso a GET /api/cotizaciones), igual que en la
          // rama Vendedor. Sin esto la actividad reciente muestra "—".
          const [cotizacionesResponse, ...respuestas] = await Promise.all([
            apiGet("/api/cotizaciones").catch(() => null),
            ...estados.map((estado) =>
              apiGet("/api/ordenes-trabajo", { params: { estado } }),
            ),
          ]);
          const cotizacionesPorId = new Map(
            (cotizacionesResponse?.data ?? []).map((cotizacion) => [
              cotizacion.id,
              cotizacion,
            ]),
          );
          ordenes = respuestas.flatMap(({ data }) =>
            Array.isArray(data) ? data : [],
          ).map((orden) => {
            const cotizacion = cotizacionesPorId.get(
              orden.cotizacionId ?? orden.cotizacion_id,
            );
            if (cotizacion?.cliente_razon_social == null) return orden;
            return {
              ...orden,
              cliente_razon_social: cotizacion.cliente_razon_social,
            };
          });
        }

        if (!cancelado) {
          const unicas = [...new Map(ordenes.map((orden) => [orden.id, orden])).values()];
          setOrdenesTrabajo(unicas.map(mapItem));
          setError(null);
          setCargando(false);
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              "No se pudieron cargar las órdenes de trabajo.",
          );
          setCargando(false);
        }
      }
    };

    const manejarRecarga = () => cargar();
    window.addEventListener("qualitytrack:ordenes-recargar", manejarRecarga);
    cargar();
    return () => {
      cancelado = true;
      window.removeEventListener("qualitytrack:ordenes-recargar", manejarRecarga);
    };
  }, [isAuthenticated, puedeConsultar, user?.rol]);

  const recargar = useCallback(() => {
    setError(null);
    setCargando(true);

    window.dispatchEvent(new Event("qualitytrack:ordenes-recargar"));
  }, []);

  const fusionar = useCallback((item) => {
    const mapeada = mapItem(item);

    setOrdenesTrabajo((prev) =>
      prev.map((orden) =>
        orden.id === mapeada.id ? { ...orden, ...mapeada } : orden,
      ),
    );

    return mapeada;
  }, []);

  const registrarEntrega = useCallback(
    async ({ id, receptor_nombre }) => {
      // RBAC espejo del backend (issue #157): solo VENDEDOR ejecuta entregas.
      // POST /api/ordenes-trabajo/{id}/entrega exige rol VENDEDOR y
      // retorna 403 para otros roles.
      if (user?.rol !== "VENDEDOR") {
        const forbidden = new Error("No tienes permisos para esta acción.");
        forbidden.status = 403;
        forbidden.response = {
          status: 403,
          data: { error: "No tienes permisos para esta acción." },
        };
        throw forbidden;
      }

      const orden = ordenesTrabajo.find((item) => item.id === Number(id));

      if (!orden) {
        throw new Error("No se encontró la orden de trabajo.");
      }

      if (orden.estado !== "DESPACHO") {
        throw new Error(
          "La orden de trabajo no se encuentra en estado Despacho.",
        );
      }

      if (!receptor_nombre?.trim()) {
        throw new Error("Debe indicar el nombre del receptor.");
      }

      const nombreNormalizado = receptor_nombre.trim();

      // Issue #210: la entrega se registra contra la API. El backend
      // (Jackson SNAKE_CASE) espera `{ receptor_nombre }` y responde un
      // OrdenTrabajoDTO que ya incluye `receptor_nombre` y las fechas de
      // pase; se fusiona con los datos locales enriquecidos (cliente,
      // pieza) que el DTO no trae.
      const { data } = await apiPost(
        `/api/ordenes-trabajo/${orden.id}/entrega`,
        { receptor_nombre: nombreNormalizado },
      );

      return fusionar({
        ...orden,
        ...data,
        receptor_nombre: nombreNormalizado,
      });
    },
    [ordenesTrabajo, fusionar, user?.rol],
  );

  const obtenerOrdenTrabajo = useCallback(
    (id) => ordenesTrabajo.find((item) => item.id === Number(id)) ?? null,
    [ordenesTrabajo],
  );

  const ordenesDisponibles =
    isAuthenticated && puedeConsultar ? ordenesTrabajo : [];

  return (
    <OrdenesTrabajoContext.Provider
      value={{
        ordenesTrabajo: ordenesDisponibles,
        cargando,
        error,
        recargar,
        registrarEntrega,
        obtenerOrdenTrabajo,
      }}
    >
      {children}
    </OrdenesTrabajoContext.Provider>
  );
};
