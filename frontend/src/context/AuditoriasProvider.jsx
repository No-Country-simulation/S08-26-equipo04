import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { AuditoriasContext } from "./AuditoriasContext";
import ordenesTrabajoMock from "../mocks/ordenes-trabajo.json";
import auditoriasMock from "../mocks/auditorias.json";
import { CRITERIOS_CHECKLIST } from "../pages/calidad/checklist";

const mapOrden = (item) => ({
  ...item,
  numero_ot: item.numero_ot ?? item.numeroOT ?? "OT-—",
  cliente_razon_social: item.cliente_razon_social ?? item.cliente ?? "—",
  descripcion_pieza: item.descripcion_pieza ?? item.pieza_trabajo ?? "—",
  created_at: item.created_at ?? null,
  updated_at: item.updated_at ?? null,
});

const VALORES_CHECKLIST = ["CUMPLE", "NO_CUMPLE", "NO_APLICA"];

export const AuditoriasProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const puedeConsultar = user?.rol === "CALIDAD";

  const [ordenesTrabajo, setOrdenesTrabajo] = useState(() =>
    ordenesTrabajoMock.map(mapOrden),
  );
  const [auditorias, setAuditorias] = useState(() => [...auditoriasMock]);

  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Simula la carga inicial del mock hasta que exista endpoint real.
  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 400);

    return () => clearTimeout(timer);
  }, []);

  const recargar = useCallback(() => {
    setError(null);
    setCargando(true);

    setOrdenesTrabajo(ordenesTrabajoMock.map(mapOrden));
    setAuditorias([...auditoriasMock]);
    setCargando(false);
  }, []);

  const obtenerOrdenTrabajo = useCallback(
    (id) => ordenesTrabajo.find((item) => item.id === Number(id)) ?? null,
    [ordenesTrabajo],
  );

  const auditoriasDeOT = useCallback(
    (ordenTrabajoId) =>
      auditorias
        .filter((item) => item.orden_trabajo_id === Number(ordenTrabajoId))
        .sort((a, b) =>
          String(b.fecha_veredicto ?? "").localeCompare(
            String(a.fecha_veredicto ?? ""),
          ),
        ),
    [auditorias],
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
        criterio_nombre: criterio.criterio_nombre,
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

      if (resultado === "NO_CONFORME" && !observaciones?.trim()) {
        throw new Error(
          "Las observaciones son obligatorias si el veredicto es No conforme.",
        );
      }

      const ahora = new Date().toISOString();
      const previas = auditorias.filter(
        (item) => item.orden_trabajo_id === Number(orden_trabajo_id),
      );

      const nueva = {
        id: Math.max(0, ...auditorias.map((item) => item.id)) + 1,
        orden_trabajo_id: Number(orden_trabajo_id),
        ot_numero: orden.numero_ot,
        auditor_id: user?.id ?? null,
        auditor_nombre: user?.nombre ?? null,
        numero_auditoria:
          Math.max(0, ...previas.map((item) => item.numero_auditoria ?? 0)) + 1,
        resultado,
        observaciones_generales: observaciones?.trim() || null,
        fecha_veredicto: ahora,
        created_at: ahora,
        checklist: respuestas,
      };

      setAuditorias((prev) => [...prev, nueva]);

      // Derivación según veredicto (HU-4.3): Conforme → Despacho,
      // No conforme → vuelve al Jefe de producción.
      setOrdenesTrabajo((prev) =>
        prev.map((item) =>
          item.id === Number(orden_trabajo_id)
            ? {
                ...item,
                estado: resultado === "CONFORME" ? "DESPACHO" : "NO_CONFORME",
                // Solo Calidad fecha el pase; el ingreso a Despacho lo
                // registra el backend al migrar el endpoint.
                fecha_pase_calidad:
                  resultado === "CONFORME" ? ahora : item.fecha_pase_calidad,
                updated_at: ahora,
              }
            : item,
        ),
      );

      return nueva;
    },
    [ordenesTrabajo, auditorias, user],
  );

  const ordenesDisponibles =
    isAuthenticated && puedeConsultar ? ordenesTrabajo : [];

  return (
    <AuditoriasContext.Provider
      value={{
        ordenesTrabajo: ordenesDisponibles,
        auditorias,
        cargando,
        error,
        recargar,
        registrarAuditoria,
        obtenerOrdenTrabajo,
        auditoriasDeOT,
      }}
    >
      {children}
    </AuditoriasContext.Provider>
  );
};
