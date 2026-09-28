import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost, extractApiMessage } from "../api";

// Circuito de No Conformidad del Jefe (HU-2.3, issue #100).
// Todo contra API real: el backend ya expone el filtro por OT, el POST de
// rehacer con operario/tiempo y las notas (BE #223/#231).
//
// - GET /api/ordenes-trabajo?estado=NO_CONFORME (observaciones del defecto
//   vía GET /api/calidad/{ot}/ultima-auditoria)
// - GET /api/ot-fases?orden_trabajo_id=X (fases de la OT; se filtra la
//   iteración actual: mayor ciclo por secuencia)
// - GET /api/fases/{catalogoId}/operarios (habilitados para reasignar)
// - POST /api/ot-fases {orden_trabajo_id, fases:[{fase_id, operario_id,
//   tiempo_estimado_minutos}]} + POST /api/ot-fases/{id}/notas {contenido}

const mapOrden = (item) => ({
  ...item,
  numero_ot: item.numero_ot ?? item.numeroOT ?? item.numero_o_t ?? "OT-—",
  cliente_razon_social: item.cliente_razon_social ?? item.cliente ?? "—",
  descripcion_pieza: item.descripcion_pieza ?? item.pieza_trabajo ?? "—",
});

// Iteración actual: por cada secuencia se queda con el ciclo más alto.
// Solo fases TERMINADO se pueden mandar a rehacer.
export const fasesRehaceables = (fases) => {
  const porSecuencia = new Map();
  (fases ?? []).forEach((fase) => {
    const secuencia = fase.numero_secuencia ?? fase.numeroSecuencia;
    const ciclo = fase.ciclo_iteracion ?? fase.cicloIteracion ?? 1;
    const actual = porSecuencia.get(secuencia);
    const cicloActual =
      actual?.ciclo_iteracion ?? actual?.cicloIteracion ?? 1;
    if (!actual || ciclo > cicloActual) porSecuencia.set(secuencia, fase);
  });
  return [...porSecuencia.values()]
    .filter((fase) => (fase.estado ?? fase.estadoFase) === "TERMINADO")
    .sort(
      (a, b) =>
        (a.numero_secuencia ?? a.numeroSecuencia ?? 0) -
        (b.numero_secuencia ?? b.numeroSecuencia ?? 0),
    );
};

export const useNoConformidades = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      const { data: noConformes } = await apiGet("/api/ordenes-trabajo", {
        params: { estado: "NO_CONFORME" },
      });
      const lista = Array.isArray(noConformes) ? noConformes : [];

      // Enriquecimiento igual que el provider del Jefe: cliente/pieza por
      // cotización, más la última auditoría (observaciones del defecto).
      const [cotizacionesResponse, ...auditorias] = await Promise.all([
        apiGet("/api/cotizaciones").catch(() => null),
        ...lista.map((orden) =>
          apiGet(`/api/calidad/${orden.id}/ultima-auditoria`)
            .then(({ data }) => data)
            .catch(() => null),
        ),
      ]);
      const cotizacionesPorId = new Map(
        (cotizacionesResponse?.data ?? []).map((cotizacion) => [
          cotizacion.id,
          cotizacion,
        ]),
      );
      return lista.map((orden, index) => {
        const cotizacion = cotizacionesPorId.get(
          orden.cotizacionId ?? orden.cotizacion_id,
        );
        return {
          ...mapOrden({
            ...orden,
            cliente_razon_social:
              cotizacion?.cliente_razon_social ??
              orden.cliente_razon_social ??
              orden.cliente ??
              "—",
            descripcion_pieza:
              cotizacion?.descripcion_pieza ??
              orden.descripcion_pieza ??
              orden.pieza_trabajo ??
              "—",
            cantidad: cotizacion?.cantidad ?? orden.cantidad ?? null,
          }),
          auditoria: auditorias[index],
        };
      });
    };

    cargar().then(
      (lista) => {
        if (cancelado) return;
        setOrdenes(lista);
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        setError(
          extractApiMessage(err, "No se pudieron cargar las no conformidades."),
        );
        setCargando(false);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [version]);

  const recargar = useCallback(() => {
    setError(null);
    setCargando(true);
    setVersion((v) => v + 1);
  }, []);

  const cargarFasesOt = useCallback(async (ordenTrabajoId) => {
    const { data } = await apiGet("/api/ot-fases", {
      params: { orden_trabajo_id: ordenTrabajoId },
    });
    return fasesRehaceables(Array.isArray(data) ? data : []);
  }, []);

  const cargarOperarios = useCallback(async (faseCatalogoId) => {
    const { data } = await apiGet(`/api/fases/${faseCatalogoId}/operarios`);
    return Array.isArray(data) ? data : [];
  }, []);

  const enviarARehacer = useCallback(
    async ({ ordenTrabajoId, selecciones }) => {
      if (!selecciones?.length) {
        throw new Error("Debe seleccionar al menos una fase para rehacer.");
      }
      let creadas;
      try {
        ({ data: creadas } = await apiPost("/api/ot-fases", {
          orden_trabajo_id: ordenTrabajoId,
          fases: selecciones.map((item) => ({
            fase_id: item.faseId,
            operario_id: item.operarioId,
            tiempo_estimado_minutos: Number(item.tiempoEstimadoMinutos),
          })),
        }));
      } catch (err) {
        throw new Error(
          extractApiMessage(err, "No se pudieron derivar las fases a rehacer."),
          { cause: err },
        );
      }
      // Las notas van a las fases recién creadas (nuevo intento). Si alguna
      // falla no se revierte el rehacer: se avisa cuáles quedaron sin nota.
      const notas = selecciones
        .map((item, index) => ({ texto: item.nota?.trim() || null, creada: creadas?.[index] }))
        .filter((item) => item.texto && item.creada?.id);
      const fallidas = [];
      await Promise.all(
        notas.map(({ texto, creada }) =>
          apiPost(`/api/ot-fases/${creada.id}/notas`, {
            contenido: texto,
          }).catch(() => fallidas.push(creada.id)),
        ),
      );
      // La OT vuelve a producción: sale de la lista sin recargar.
      setOrdenes((prev) =>
        prev.filter((orden) => orden.id !== Number(ordenTrabajoId)),
      );
      return { creadas, notasFallidas: fallidas };
    },
    [],
  );

  return {
    ordenes,
    cargando,
    error,
    recargar,
    cargarFasesOt,
    cargarOperarios,
    enviarARehacer,
  };
};
