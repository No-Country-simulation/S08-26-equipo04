import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, extractApiMessage } from '../api';
import { useAuth } from './AuthContext';
import { OtFasesContext } from './OtFasesContext';

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
 * - El DTO (OtFaseResponseDTO, SNAKE_CASE) trae `numero_ot` (campo
 *   `numeroOt`, BE #211/#214; se acepta tambien `ot_numero` por robustez).
 *   Si alguna fase llegara sin numero se completa con
 *   GET /api/ordenes-trabajo/{id} (permitido para OPERARIO) y, si ese
 *   request falla, queda en `null`: sin numero inventado. `fase_nombre` se
 *   muestra como "Fase sin nombre" si no viniera.
 * - El detalle de la tarea resuelve la cadena OT -> cotizacion -> solicitud
 *   por API para traer los adjuntos, y las notas por
 *   GET /api/ot-fases/{id}/notas.
 *
 * Nota: la deuda BE #36/#87 (adjuntos y notas sin endpoint) ya esta sanada:
 * el detalle consume GET /api/solicitudes/{id}/documentos,
 * GET /api/documentos/{id} y GET /api/ot-fases/{id}/notas (ver
 * TaskDetailModal).
 */

// El backend responde `mensaje` (ErrorResponse), asi que se reusa el helper
// que ya sabe leerlo y solo se agrega el mensaje de Render en frio.
const extractMessage = (error, fallback) =>
  extractApiMessage(
    error,
    error?.code === 'ECONNABORTED'
      ? 'El servidor tarda en responder (Render en frio). Reintenta.'
      : fallback,
  );

const numeroOTDe = (orden) =>
  orden?.numero_ot ?? orden?.numeroOT ?? orden?.numero_o_t ?? null;

const mapItem = (item, operarioNombre = null) => ({
  ...item,
  // Sin fallback a catalogo local: si el DTO no trae el nombre queda en
  // null y la vista lo muestra como faltante.
  fase_nombre: item.fase_nombre ?? item.faseNombre ?? null,
  operario_nombre: item.operario_nombre ?? operarioNombre,
  // El DTO manda `numeroOt` (serializado como `numero_ot`, no `ot_numero`).
  ot_numero: item.ot_numero ?? item.numero_ot ?? item.numeroOt ?? null,
  // No vienen en el DTO de fases: los completa `cargarLista` con la
  // cotizacion, y la card los omite si siguen faltando.
  descripcion_pieza: item.descripcion_pieza ?? null,
  cantidad: item.cantidad ?? null,
  created_at: item.created_at ?? null,
  updated_at: item.updated_at ?? null,
});

// Fusiona la fase devuelta por el POST con la que ya teniamos enriquecida:
// el POST no trae los datos calculados por `cargarLista` (ot_numero por OT,
// pieza/cantidad por cotizacion), asi que los null no deben pisarlos.
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
});

export const OtFasesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // El GET /api/ot-fases permite OPERARIO y JEFE_PRODUCCION: no pedirlo con
  // otros roles para no disparar 403 (toast de permisos).
  const puedeConsultar =
    user?.rol === 'OPERARIO' || user?.rol === 'JEFE_PRODUCCION';
  const [otFases, setOtFases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  // GET /api/ot-fases + ot_numero real por OT. Sin numero inventado: si la
  // OT no se puede resolver queda en `null` y la vista muestra "—".
  const cargarLista = useCallback(async () => {
    const { data } = await apiGet('/api/ot-fases');
    const base = (data ?? []).map((item) =>
      mapItem(item, user?.nombre ?? null),
    );
    // El DTO de fases no trae `descripcion_pieza` ni `cantidad` (BE #211 solo
    // sumo `numero_ot` y `fase_nombre`), asi que la card los resuelve por la
    // cadena OT -> cotizacion, que si puede leer el OPERARIO. Solo se pide
    // para las OT distintas que de verdad falten: si el DTO crece, no se
    // dispara ningun request.
    const faltaDato = (fase) =>
      fase.ot_numero == null ||
      fase.descripcion_pieza == null ||
      fase.cantidad == null;
    const ids = [
      ...new Set(
        base
          .filter(faltaDato)
          .map((fase) => fase.orden_trabajo_id)
          .filter((id) => id != null),
      ),
    ];
    if (ids.length === 0) return base;
    // Cada request arma su propio parche y solo guarda claves con valor: si
    // algo falla, la fase conserva lo que el DTO ya traia.
    const parches = await Promise.all(
      ids.map(async (id) => {
        const parche = {};
        try {
          const { data: orden } = await apiGet(`/api/ordenes-trabajo/${id}`);
          const numero = numeroOTDe(orden);
          if (numero != null) parche.ot_numero = numero;
          const cotizacionId = orden?.cotizacion_id ?? null;
          if (cotizacionId != null) {
            const { data: cotizacion } = await apiGet(
              `/api/cotizaciones/${cotizacionId}`,
            );
            const pieza = cotizacion?.descripcion_pieza ?? null;
            const cantidad = cotizacion?.cantidad ?? null;
            if (pieza != null) parche.descripcion_pieza = pieza;
            if (cantidad != null) parche.cantidad = cantidad;
          }
        } catch {
          // Sin patch: la card muestra el dato como faltante, sin inventar.
        }
        return [id, parche];
      }),
    );
    const porOrden = new Map(parches);
    return base.map((fase) => ({
      ...fase,
      ...(porOrden.get(fase.orden_trabajo_id) ?? {}),
    }));
  }, [user?.nombre]);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelado = false;
    const promesa =
      isAuthenticated && puedeConsultar
        ? cargarLista()
        : Promise.resolve(null);
    promesa.then(
      (lista) => {
        if (cancelado) return;
        setOtFases(lista ?? []);
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        setError(extractMessage(err, 'No se pudieron cargar las tareas.'));
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
      const { data } = await apiPost(`/api/ot-fases/${id}/iniciar`, {});
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
      throw new Error(extractMessage(err, 'No se pudo iniciar la tarea.'), {
        cause: err,
      });
    }
  };

  const finalizarFase = async (id) => {
    let data;
    try {
      ({ data } = await apiPost(`/api/ot-fases/${id}/finalizar`, {}));
    } catch (err) {
      throw new Error(extractMessage(err, 'No se pudo terminar la tarea.'), {
        cause: err,
      });
    }
    const terminada = mapItem(data, user?.nombre ?? null);
    const lista = await cargarLista();
    const listaFusionada = lista.some((fase) => fase.id === terminada.id)
      ? lista.map((fase) =>
          fase.id === terminada.id ? fusionarEnriquecida(fase, terminada) : fase,
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
            (fase.numero_secuencia ?? 0) >
              (terminada.numero_secuencia ?? 0) &&
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

  return <OtFasesContext.Provider value={value}>{children}</OtFasesContext.Provider>;
};
