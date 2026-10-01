import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost, extractApiMessage } from "../api";
import { useAuth } from "./AuthContext";
import { OtFasesContext } from "./OtFasesContext";

/**
 * Provider de fases de OT para el Operario (HU-3.1) contra API real.
 *
 * Regla de esta migracion: sin mocks. Si el backend no manda un dato, queda
 * en `null` y la vista lo muestra como faltante ("—" / "sin datos") en vez
 * de inventarlo: asi los huecos del contrato se ven y no se tapan errores.
 *
 * - GET /api/ot-fases filtra por el operario logueado via JWT: no hay
 *   filtrado local por usuario.
 * - POST /api/ot-fases/{id}/iniciar y /finalizar resuelven la transicion en
 *   backend (siguiente fase a EN_COLA u OT a Calidad): despues de cada
 *   mutacion se refresca la lista en vez de simularla local.
 * - El DTO (OtFaseResponseDTO, SNAKE_CASE) ya trae `numero_ot`,
 *   `fase_nombre`, `descripcion_pieza`, `cantidad` y `solicitud_id`
 *   (BE #211/#214 para los dos primeros, BE #219 para los tres ultimos):
 *   la lista sale de un solo GET, sin cadena OT -> cotizacion.
 *   Si algun campo faltara queda en `null` y la vista lo muestra como
 *   faltante ("—" / "sin datos"): sin numero ni datos inventados.
 * - El detalle de la tarea pide los adjuntos directo con `solicitud_id`
 *   y las notas por GET /api/ot-fases/{id}/notas.
 *
 * Nota: la deuda BE #36/#87 (adjuntos y notas sin endpoint) ya esta sanada:
 * el detalle consume GET /api/solicitudes/{id}/documentos,
 * GET /api/documentos/{id} y GET /api/ot-fases/{id}/notas (ver
 * TaskDetailModal).
 */

// El backend responde `mensaje` (ErrorResponse), asi que se reusa el helper
// que ya sabe leerlo y solo se agrega el mensaje de Render en frio.
// Los 500 se mapean al fallback amigable: no se expone el genérico
// "Error interno del servidor" en la vista del operario.
const extractMessage = (error, fallback) => {
  if (error?.response?.status >= 500) return fallback;
  return extractApiMessage(
    error,
    error?.code === "ECONNABORTED"
      ? "El servidor tarda en responder (Render en frio). Reintenta."
      : fallback,
  );
};

const mapItem = (item, operarioNombre = null) => ({
  ...item,
  // Sin fallback a catalogo local: si el DTO no trae el nombre queda en
  // null y la vista lo muestra como faltante.
  fase_nombre: item.fase_nombre ?? item.faseNombre ?? null,
  operario_nombre: item.operario_nombre ?? operarioNombre,
  // El DTO manda `numeroOt` (serializado como `numero_ot`, no `ot_numero`).
  ot_numero: item.ot_numero ?? item.numero_ot ?? item.numeroOt ?? null,
  // BE #219: pieza, cantidad y solicitud ya vienen en el DTO.
  descripcion_pieza: item.descripcion_pieza ?? null,
  cantidad: item.cantidad ?? null,
  solicitud_id: item.solicitud_id ?? item.solicitudId ?? null,
  created_at: item.created_at ?? null,
  updated_at: item.updated_at ?? null,
});

// Fusiona la fase devuelta por el POST con la que ya teniamos: el POST usa
// el mismo convertirADTO, pero si algun campo viniera en null no debe pisar
// lo que ya estaba cargado.
const fusionarEnriquecida = (previa, actualizada) => ({
  ...previa,
  ...actualizada,
  fase_nombre: actualizada.fase_nombre ?? previa.fase_nombre ?? null,
  operario_nombre:
    actualizada.operario_nombre ?? previa.operario_nombre ?? null,
  ot_numero: actualizada.ot_numero ?? previa.ot_numero ?? null,
  descripcion_pieza:
    actualizada.descripcion_pieza ?? previa.descripcion_pieza ?? null,
  cantidad: actualizada.cantidad ?? previa.cantidad ?? null,
  solicitud_id: actualizada.solicitud_id ?? previa.solicitud_id ?? null,
});

export const OtFasesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // El GET /api/ot-fases permite OPERARIO y JEFE_PRODUCCION: no pedirlo con
  // otros roles para no disparar 403 (banner de permisos).
  const puedeConsultar =
    user?.rol === "OPERARIO" || user?.rol === "JEFE_PRODUCCION";
  const [otFases, setOtFases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  // GET /api/ot-fases: el DTO ya trae numero, pieza, cantidad y solicitud
  // (BE #219), asi que es un solo request sin cadena OT -> cotizacion.
  // silenciarToast: los fallos de carga se muestran solo en el ErrorBanner
  // persistente de la vista (una sola señal, igual que iniciar/finalizar).
  const cargarLista = useCallback(async () => {
    const { data } = await apiGet("/api/ot-fases", {
      silenciarToast: true,
    });
    return (data ?? []).map((item) => mapItem(item, user?.nombre ?? null));
  }, [user?.nombre]);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelado = false;
    const promesa =
      isAuthenticated && puedeConsultar ? cargarLista() : Promise.resolve(null);
    promesa.then(
      (lista) => {
        if (cancelado) return;
        setOtFases(lista ?? []);
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        setError(extractMessage(err, "No se pudieron cargar las tareas."));
        setCargando(false);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [isAuthenticated, puedeConsultar, version, cargarLista]);

  const recargar = () => {
    setCargando(true);
    setError(null);
    setVersion((v) => v + 1);
  };

  const iniciarFase = async (id) => {
    try {
      // silenciarToast: la vista muestra ErrorBanner persistente (una sola
      // señal) en vez del toast global.
      const { data } = await apiPost(
        `/api/ot-fases/${id}/iniciar`,
        {},
        {
          silenciarToast: true,
        },
      );
      const actualizada = mapItem(data, user?.nombre ?? null);
      const lista = await cargarLista();
      setOtFases(
        lista.some((fase) => fase.id === actualizada.id)
          ? lista.map((fase) =>
              fase.id === actualizada.id
                ? fusionarEnriquecida(fase, actualizada)
                : fase,
            )
          : [...lista, actualizada],
      );
      return actualizada;
    } catch (err) {
      throw new Error(
        extractMessage(err, "No se pudo iniciar la tarea. Intenta nuevamente."),
        {
          cause: err,
        },
      );
    }
  };

  const finalizarFase = async (id) => {
    let data;
    try {
      ({ data } = await apiPost(
        `/api/ot-fases/${id}/finalizar`,
        {},
        {
          silenciarToast: true,
        },
      ));
    } catch (err) {
      throw new Error(
        extractMessage(
          err,
          "No se pudo terminar la tarea. Intenta nuevamente.",
        ),
        {
          cause: err,
        },
      );
    }
    const terminada = mapItem(data, user?.nombre ?? null);
    const lista = await cargarLista();
    const listaFusionada = lista.some((fase) => fase.id === terminada.id)
      ? lista.map((fase) =>
          fase.id === terminada.id
            ? fusionarEnriquecida(fase, terminada)
            : fase,
        )
      : [...lista, terminada];
    setOtFases(listaFusionada);
    // El POST solo devuelve la fase terminada: el estado de la OT dice si
    // paso a Calidad. La siguiente fase solo se puede inferir si quedo en
    // mi lista (GET /api/ot-fases filtra por JWT): si es de otro operario
    // no la veo y la vista usa un mensaje generico sin nombre.
    let otEstado = null;
    try {
      const { data: orden } = await apiGet(
        `/api/ordenes-trabajo/${terminada.orden_trabajo_id}`,
      );
      otEstado = orden?.estado ?? orden?.estado_ot ?? null;
    } catch {
      // Sin estado de OT: la vista usa un mensaje generico.
    }
    const siguienteMia =
      listaFusionada
        .filter(
          (fase) =>
            fase.id !== terminada.id &&
            fase.orden_trabajo_id === terminada.orden_trabajo_id &&
            (fase.numero_secuencia ?? 0) > (terminada.numero_secuencia ?? 0) &&
            fase.estado !== "TERMINADO",
        )
        .sort(
          (a, b) => (a.numero_secuencia ?? 0) - (b.numero_secuencia ?? 0),
        )[0] ?? null;
    return { terminada, lista: listaFusionada, otEstado, siguienteMia };
  };

  const value = {
    otFases,
    cargando,
    error,
    recargar,
    iniciarFase,
    finalizarFase,
  };

  return (
    <OtFasesContext.Provider value={value}>{children}</OtFasesContext.Provider>
  );
};
