import { useCallback, useEffect, useState } from "react";
import { apiGet, extractApiMessage, listarAdjuntos } from "../api";
import { useOrdenesTrabajo } from "./useOrdenesTrabajo";

// Expediente del Vendedor (issue #213, HU-1.2).
//
// Compone datos reales de endpoints que el rol VENDEDOR puede consultar:
// - GET /api/ordenes-trabajo/{id}/expediente (cabecera, cliente, monto)
// - GET /api/ordenes-trabajo/cotizacion/{id} (OT completa: estado, fechas, receptor)
// - GET /api/cotizaciones/{id} o /solicitud/{id} (fases planificadas, solicitud)
// - GET /api/solicitudes/{id}/documentos (adjuntos)
// - GET /api/calidad/{id}/ultima-auditoria (veredicto; 404 = aún sin auditar)
//
// Hueco BE conocido: el expediente devuelve `historial_fases: []` y
// `resultado_calidad: "Pendiente"`, y GET /api/ot-fases no permite VENDEDOR.
// Por eso la Hoja de ruta muestra lo planificado (cotización) y el avance
// en vivo queda pendiente de backend. Si un dato no viene, queda en null y
// la vista lo muestra como faltante ("—"), sin inventarlo.

const resolverOt = (param, lista) => {
  if (param == null || param === "") return { otId: null, cotizacionId: null };
  const encontrada = (lista ?? []).find(
    (ot) =>
      ot.id === Number(param) ||
      ot.numero_ot === param ||
      ot.numeroOT === param,
  );
  if (encontrada) {
    return {
      otId: encontrada.id,
      cotizacionId:
        encontrada.cotizacionId ?? encontrada.cotizacion_id ?? null,
    };
  }
  return /^\d+$/.test(param)
    ? { otId: Number(param), cotizacionId: null }
    : { otId: null, cotizacionId: null };
};

const estadoInicial = {
  expediente: null,
  orden: null,
  cotizacion: null,
  documentos: { lista: [], error: null },
  auditoria: null,
  cargando: true,
  error: null,
  noEncontrada: false,
};

export const useExpediente = (otParam) => {
  const { ordenesTrabajo, cargando: cargandoLista } = useOrdenesTrabajo();
  const [datos, setDatos] = useState(estadoInicial);
  const [version, setVersion] = useState(0);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    if (cargandoLista) return undefined;
    let cancelado = false;

    const cargar = async () => {
      const { otId, cotizacionId: cidLista } = resolverOt(
        otParam,
        ordenesTrabajo,
      );
      if (otId == null) return { noEncontrada: true };

      const { data: expediente } = await apiGet(
        `/api/ordenes-trabajo/${otId}/expediente`,
      );
      const solicitudId =
        expediente.solicitud_id ?? expediente.solicitudId ?? null;

      let cotizacion = null;
      if (cidLista != null) {
        ({ data: cotizacion } = await apiGet(
          `/api/cotizaciones/${cidLista}`,
        ));
      } else if (solicitudId != null) {
        ({ data: cotizacion } = await apiGet(
          `/api/cotizaciones/solicitud/${solicitudId}`,
        ));
      }
      const cid = cotizacion?.id ?? cidLista;

      const [orden, documentos, auditoria] = await Promise.all([
        cid != null
          ? apiGet(`/api/ordenes-trabajo/cotizacion/${cid}`)
              .then(({ data }) => data)
              .catch(() => null)
          : Promise.resolve(null),
        solicitudId != null
          ? listarAdjuntos(solicitudId).then(
              (lista) => ({ lista, error: null }),
              (err) => ({
                lista: [],
                error: extractApiMessage(
                  err,
                  "No se pudieron cargar los documentos.",
                ),
              }),
            )
          : Promise.resolve({ lista: [], error: null }),
        // Sin auditoría todavía (404) no es error: la pestaña Calidad
        // muestra el aviso de disponibilidad. Se silencia el toast global
        // del interceptor porque ese 404 es un caso esperado.
        apiGet(`/api/calidad/${otId}/ultima-auditoria`, {
          silenciarToast: true,
        })
          .then(({ data }) => data)
          .catch(() => null),
      ]);

      return { expediente, orden, cotizacion, documentos, auditoria };
    };

    cargar().then(
      (resultado) => {
        if (cancelado) return;
        setDatos({ ...estadoInicial, ...resultado, cargando: false });
      },
      (err) => {
        if (cancelado) return;
        if (err?.response?.status === 404) {
          setDatos({ ...estadoInicial, cargando: false, noEncontrada: true });
          return;
        }
        setDatos({
          ...estadoInicial,
          cargando: false,
          error: extractApiMessage(
            err,
            "No se pudo cargar el expediente.",
          ),
        });
      },
    );
    return () => {
      cancelado = true;
    };
  }, [otParam, ordenesTrabajo, cargandoLista, version]);

  const recargar = useCallback(() => {
    setDatos((prev) => ({ ...prev, cargando: true, error: null }));
    setVersion((v) => v + 1);
  }, []);

  return { ...datos, recargar };
};
