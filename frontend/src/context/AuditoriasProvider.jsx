import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import { useAuth } from "./AuthContext";
import { AuditoriasContext } from "./AuditoriasContext";
import { CRITERIOS_CHECKLIST } from "../pages/calidad/checklist";

const mapOrden = (item) => ({
  ...item,
  // El DTO de OT manda `numeroOT` (llega como `numero_o_t` por el
  // SNAKE_CASE global del backend), no `numero_ot`.
  numero_ot: item.numero_ot ?? item.numeroOT ?? item.numero_o_t ?? "OT-—",
  cliente_razon_social: item.cliente_razon_social ?? item.cliente ?? "—",
  descripcion_pieza: item.descripcion_pieza ?? item.pieza_trabajo ?? "—",
  // El DTO manda fecha_creacion/fecha_actualizacion, no created_at.
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

const VALORES_CHECKLIST = ["CUMPLE", "NO_CUMPLE", "NO_APLICA"];

export const AuditoriasProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const puedeConsultar = user?.rol === "CALIDAD";

  const [ordenesTrabajo, setOrdenesTrabajo] = useState([]);

  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Issue #208: el panel lista las OT pendientes con GET /api/calidad.
  // El DTO no trae cliente/pieza/cantidad: se enriquece con la cotización
  // por id (GET /api/cotizaciones/{id} permite CALIDAD; solo el listado
  // está reservado a VENDEDOR/JEFE).
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
        const { data } = await apiGet("/api/calidad");
        const lista = Array.isArray(data) ? data : [];

        const cotizaciones = await Promise.all(
          lista.map((orden) => {
            const cotizacionId =
              orden.cotizacionId ?? orden.cotizacion_id ?? null;
            if (cotizacionId == null) return null;
            return apiGet(`/api/cotizaciones/${cotizacionId}`)
              .then(({ data: cotizacion }) => cotizacion ?? null)
              .catch(() => null);
          }),
        );
        const cotizacionesPorId = new Map();
        cotizaciones.forEach((cotizacion) => {
          if (cotizacion?.id != null) cotizacionesPorId.set(cotizacion.id, cotizacion);
        });

        const enriquecidas = lista.map((orden) => {
          const cotizacion = cotizacionesPorId.get(
            orden.cotizacionId ?? orden.cotizacion_id,
          );
          if (!cotizacion) return orden;
          return {
            ...orden,
            cliente_razon_social:
              cotizacion.cliente_razon_social ??
              cotizacion.clienteRazonSocial ??
              orden.cliente ??
              "—",
            descripcion_pieza:
              cotizacion.descripcion_pieza ??
              cotizacion.descripcionPieza ??
              orden.pieza_trabajo ??
              "—",
            cantidad: cotizacion.cantidad ?? orden.cantidad ?? null,
            fecha_esperada_entrega:
              cotizacion.fecha_esperada_entrega ??
              cotizacion.fechaEsperadaEntrega ??
              orden.fecha_esperada_entrega ??
              null,
          };
        });

        if (!cancelado) {
          setOrdenesTrabajo(enriquecidas.map(mapOrden));
          setError(null);
          setCargando(false);
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err?.response?.data?.mensaje ||
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              "No se pudieron cargar las órdenes en calidad.",
          );
          setCargando(false);
        }
      }
    };

    const manejarRecarga = () => cargar();
    window.addEventListener("qualitytrack:auditorias-recargar", manejarRecarga);
    cargar();
    return () => {
      cancelado = true;
      window.removeEventListener(
        "qualitytrack:auditorias-recargar",
        manejarRecarga,
      );
    };
  }, [isAuthenticated, puedeConsultar]);

  const recargar = useCallback(() => {
    setError(null);
    setCargando(true);

    window.dispatchEvent(new Event("qualitytrack:auditorias-recargar"));
  }, []);

  const obtenerOrdenTrabajo = useCallback(
    (id) => ordenesTrabajo.find((item) => item.id === Number(id)) ?? null,
    [ordenesTrabajo],
  );

  const registrarAuditoria = useCallback(
    async ({ orden_trabajo_id, resultado, checklist, observaciones }) => {
      const orden = ordenesTrabajo.find(
        (item) => item.id === Number(orden_trabajo_id),
      );

      if (!orden) {
        throw new Error("No se encontró la orden de trabajo.");
      }

      if (orden.estado !== "EN_CALIDAD") {
        throw new Error(
          "La orden de trabajo no se encuentra pendiente de control de calidad.",
        );
      }

      const respuestas = CRITERIOS_CHECKLIST.map((criterio) => ({
        item_numero: criterio.item_numero,
        resultado_item: checklist?.[criterio.item_numero] ?? null,
      }));

      if (
        respuestas.some((item) => !VALORES_CHECKLIST.includes(item.resultado_item))
      ) {
        throw new Error("Debe responder los 7 puntos del checklist.");
      }

      if (resultado !== "CONFORME" && resultado !== "NO_CONFORME") {
        throw new Error("Debe seleccionar un veredicto final.");
      }

      const observacionesNormalizadas = observaciones?.trim() ?? "";

      if (resultado === "NO_CONFORME" && !observacionesNormalizadas) {
        throw new Error(
          "Las observaciones son obligatorias si el veredicto es No conforme.",
        );
      }

      // Definición del 25/09 (issue #208): el checklist no se guarda de a
      // poco; las 7 respuestas se envían todo junto al confirmar el
      // veredicto (SNAKE_CASE global en el backend).
      const segmento = resultado === "CONFORME" ? "conforme" : "no-conforme";
      const { data } = await apiPost(`/api/calidad/${orden.id}/${segmento}`, {
        respuestas,
        resultado,
        observaciones_generales: observacionesNormalizadas || null,
      });

      // Después del veredicto la OT sale del listado sin recargar la página
      // (CONFORME → DESPACHO, NO_CONFORME → Jefe de producción).
      setOrdenesTrabajo((prev) =>
        prev.filter((item) => item.id !== Number(orden_trabajo_id)),
      );

      return data;
    },
    [ordenesTrabajo],
  );

  const ordenesDisponibles =
    isAuthenticated && puedeConsultar ? ordenesTrabajo : [];

  return (
    <AuditoriasContext.Provider
      value={{
        ordenesTrabajo: ordenesDisponibles,
        cargando,
        error,
        recargar,
        registrarAuditoria,
        obtenerOrdenTrabajo,
      }}
    >
      {children}
    </AuditoriasContext.Provider>
  );
};
