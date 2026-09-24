import { useCallback, useMemo, useState } from 'react';
import { mocks } from '../mocks';
import { OtFasesContext } from './OtFasesContext';

/**
 * Provider de fases de OT para el Operario (HU-3.1).
 *
 * Estrategia de mocks (§7.2 Plan-Trabajo): misma estructura del contrato
 * Especificacion-Tecnica §6.4. Cuando el backend entregue los endpoints
 * reales, solo se reemplaza el cuerpo de `iniciarFase` / `finalizarFase` /
 * `recargar` por llamadas axios a:
 *   GET  /api/ot-fases
 *   POST /api/ot-fases/{id}/iniciar
 *   POST /api/ot-fases/{id}/finalizar
 *
 * La transicion "fase siguiente -> Calidad" la resuelve el backend en
 * produccion; aqui se simula en el mock para no bloquear la maquetacion:
 *  - si existe fase siguiente de la misma OT -> pasa a EN_COLA
 *  - si no hay fase siguiente -> OT a estado Calidad + fecha_pase_calidad
 *    (inicio de la espera en Calidad, necesario para HU-5.4)
 */

// Retardo simulado de red para que los estados loading/spinner sean visibles.
const MOCK_LATENCY_MS = 400;

const nowIso = () => new Date().toISOString();

const diffMinutos = (inicioIso, finIso) => {
  const diff = new Date(finIso).getTime() - new Date(inicioIso).getTime();
  return Math.max(1, Math.round(diff / 60000));
};

export const OtFasesProvider = ({ children }) => {
  const [otFases, setOtFases] = useState(mocks.otFases);
  const [ordenes, setOrdenes] = useState(mocks.ordenesTrabajo);

  const iniciarFase = useCallback(
    async (id) => {
      const actual = otFases.find((fase) => fase.id === id);
      if (!actual) throw new Error('Tarea no encontrada.');
      if (actual.estado !== 'EN_COLA') {
        throw new Error(`La tarea ${actual.ot_numero} ya no esta en cola.`);
      }
      await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
      const inicio = nowIso();
      const actualizada = {
        ...actual,
        estado: 'EN_EJECUCION',
        fecha_inicio_real: inicio,
        updated_at: inicio,
      };
      setOtFases((prev) => prev.map((fase) => (fase.id === id ? actualizada : fase)));
      return actualizada;
    },
    [otFases],
  );

  const finalizarFase = useCallback(
    async (id) => {
      const actual = otFases.find((fase) => fase.id === id);
      if (!actual) throw new Error('Tarea no encontrada.');
      if (actual.estado !== 'EN_EJECUCION') {
        throw new Error('Solo se puede terminar una tarea en ejecucion.');
      }
      await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
      const fin = nowIso();
      const terminada = {
        ...actual,
        estado: 'TERMINADO',
        fecha_fin_real: fin,
        duracion_real_minutos: diffMinutos(actual.fecha_inicio_real || fin, fin),
        updated_at: fin,
      };

      // Fase siguiente de la misma OT (menor numero_secuencia mayor al actual).
      const siguiente =
        otFases
          .filter(
            (fase) =>
              fase.orden_trabajo_id === actual.orden_trabajo_id &&
              fase.numero_secuencia > actual.numero_secuencia &&
              fase.estado !== 'TERMINADO',
          )
          .sort((a, b) => a.numero_secuencia - b.numero_secuencia)[0] || null;

      setOtFases((prev) =>
        prev.map((fase) => {
          if (fase.id === id) return terminada;
          // El backend deriva la tarea al operario habilitado de esa fase;
          // en el mock se marca EN_COLA para que aparezca en su lista.
          if (siguiente && fase.id === siguiente.id && fase.estado !== 'EN_EJECUCION') {
            return { ...fase, estado: 'EN_COLA', updated_at: fin };
          }
          return fase;
        }),
      );

      // Sin fase siguiente -> la OT pasa a Calidad y se registra el inicio
      // de la espera en Calidad (dato para el tiempo promedio de HU-5.4).
      if (!siguiente) {
        setOrdenes((prev) =>
          prev.map((ot) =>
            ot.id === actual.orden_trabajo_id
              ? { ...ot, estado: 'EN_CALIDAD', fecha_pase_calidad: fin, updated_at: fin }
              : ot,
          ),
        );
      }

      return { terminada, siguiente };
    },
    [otFases],
  );

  const recargar = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    setOtFases([...mocks.otFases]);
    setOrdenes([...mocks.ordenesTrabajo]);
  }, []);

  const value = useMemo(
    () => ({ otFases, ordenes, iniciarFase, finalizarFase, recargar }),
    [otFases, ordenes, iniciarFase, finalizarFase, recargar],
  );

  return <OtFasesContext.Provider value={value}>{children}</OtFasesContext.Provider>;
};
