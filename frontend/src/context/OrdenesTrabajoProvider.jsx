import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api";
import { useAuth } from "./AuthContext";
import { OrdenesTrabajoContext } from "./OrdenesTrabajoContext";

const mapItem = (item) => ({
  ...item,
  numero_ot: item.numero_ot ?? item.numeroOT ?? "OT-—",
  cliente_razon_social: item.cliente_razon_social ?? item.cliente ?? "—",
  descripcion_pieza: item.descripcion_pieza ?? item.pieza_trabajo ?? "—",
  receptor_nombre: item.receptor_nombre ?? null,
  created_at: item.created_at ?? null,
  updated_at: item.updated_at ?? null,
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
          ordenes = respuestas
            .filter(Boolean)
            .map(({ data }) => data);
        } else {
          const estados = [
            "EN_PRODUCCION",
            "EN_CALIDAD",
            "NO_CONFORME",
            "DESPACHO",
            "ENTREGADA",
          ];
          const respuestas = await Promise.all(
            estados.map((estado) =>
              apiGet("/api/ordenes-trabajo", { params: { estado } }),
            ),
          );
          ordenes = respuestas.flatMap(({ data }) =>
            Array.isArray(data) ? data : [],
          );
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
      // El backend debe exponer POST /api/ordenes-trabajo/{id}/entrega con
      // @PreAuthorize("hasRole('VENDEDOR')") y retornar 403 para otros roles.
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

      const fechaEntrega = new Date().toISOString();

      const respuestaMock = {
        ...orden,
        estado: "ENTREGADA",
        receptor_nombre: receptor_nombre.trim(),
        fecha_entrega: fechaEntrega,
        updated_at: fechaEntrega,
      };

      return fusionar(respuestaMock);
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
