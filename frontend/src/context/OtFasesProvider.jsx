import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api';
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
 * - El DTO (OtFaseResponseDTO, SNAKE_CASE) trae solo ids: `ot_numero` se
 *   completa con GET /api/ordenes-trabajo/{id} (permitido para OPERARIO);
 *   si falla queda en `null`. `fase_nombre` queda en `null` hasta que el
 *   backend lo incluya en el DTO (GET /api/fases es 403 para este rol).
 *
 * Deuda explicita (no bloquea, BE #36 y #87): adjuntos y notas no tienen
 * endpoint todavia; el detalle muestra "sin datos" hasta que existan
 * GET /api/solicitudes/{id}/documentos y GET /api/ot-fases/{id}/notas.
 */

const extractMessage = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  (error?.code === 'ECONNABORTED'
    ? 'El servidor tarda en responder (Render en frio). Reintenta.'
    : fallback);

const numeroOTDe = (orden) =>
  orden?.numero_ot ?? orden?.numeroOT ?? orden?.numero_o_t ?? null;

const mapItem = (item, operarioNombre = null) => ({
  ...item,
  // Sin fallback a catalogo local: si el DTO no trae el nombre queda en
  // null y la vista lo muestra como faltante.
  fase_nombre: item.fase_nombre ?? null,
  operario_nombre: item.operario_nombre ?? operarioNombre,
  ot_numero: item.ot_numero ?? null,
  created_at: item.created_at ?? null,
  updated_at: item.updated_at ?? null,
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
    const ids = [
      ...new Set(
        base.map((fase) => fase.orden_trabajo_id).filter((id) => id != null),
      ),
    ];
    const resultados = await Promise.allSettled(
      ids.map((id) => apiGet(`/api/ordenes-trabajo/${id}`)),
    );
    const numeros = new Map();
    resultados.forEach((resultado, index) => {
      if (resultado.status === 'fulfilled') {
        numeros.set(ids[index], numeroOTDe(resultado.value?.data));
      }
    });
    return base.map((fase) => ({
      ...fase,
      ot_numero: fase.ot_numero ?? numeros.get(fase.orden_trabajo_id) ?? null,
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
          ? lista.map((fase) => (fase.id === actualizada.id ? { ...fase, ...actualizada } : fase))
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
    setOtFases(
      lista.some((fase) => fase.id === terminada.id)
        ? lista.map((fase) =>
            fase.id === terminada.id ? { ...fase, ...terminada } : fase,
          )
        : [...lista, terminada],
    );
    // El POST solo devuelve la fase terminada: el estado de la OT dice si
    // paso a Calidad o si la siguiente fase quedo en cola (sea mia o de otro
    // operario). Si no se puede leer, la vista usa un mensaje generico.
    let otEstado = null;
    try {
      const { data: orden } = await apiGet(
        `/api/ordenes-trabajo/${terminada.orden_trabajo_id}`,
      );
      otEstado = orden?.estado ?? orden?.estado_ot ?? null;
    } catch {
      // Sin estado de OT: la vista usa un mensaje generico.
    }
    return { terminada, lista, otEstado };
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
