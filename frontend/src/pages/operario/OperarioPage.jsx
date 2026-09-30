import { useCallback, useMemo, useState } from "react";
import { ClipboardList, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useOtFases } from "../../hooks/useOtFases";
import {
  Button,
  EmptyState,
  ErrorBanner,
  SkeletonCard,
  Title,
} from "../../components/ui";
import { TaskCardMobile } from "./TaskCardMobile";
import { TaskDetailModal } from "./TaskDetailModal";

const ESTADOS_ACTIVOS = ["EN_COLA", "EN_EJECUCION"];

export const OperarioPage = () => {
  // GET /api/ot-fases ya filtra por el operario logueado via JWT: no hay
  // filtrado local por usuario.
  const { otFases, cargando, error, recargar, iniciarFase, finalizarFase } =
    useOtFases();
  const [accionId, setAccionId] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);
  const [detalleId, setDetalleId] = useState(null);
  const [tareasSaliendo, setTareasSaliendo] = useState([]);

  const tareas = useMemo(
    () =>
      otFases
        .filter((fase) => ESTADOS_ACTIVOS.includes(fase.estado))
        .sort((a, b) => {
          if (a.estado !== b.estado)
            return a.estado === "EN_EJECUCION" ? -1 : 1;
          return a.numero_secuencia - b.numero_secuencia;
        }),
    [otFases],
  );
  const tareasVisibles = [
    ...tareas,
    ...tareasSaliendo.filter(
      (saliente) => !tareas.some((tarea) => tarea.id === saliente.id),
    ),
  ];
  // Sin trabajo en paralelo: si hay una tarea en ejecucion, las demas no se
  // pueden iniciar (evita 3-4 abiertas y confusiones al terminar).
  const hayEnEjecucion = tareas.some(
    (tarea) => tarea.estado === "EN_EJECUCION",
  );

  const handleSalidaCompleta = useCallback((id) => {
    setTareasSaliendo((prev) => prev.filter((tarea) => tarea.id !== id));
  }, []);

  const handleIniciar = async (tarea) => {
    setAccionId(tarea.id);
    setErrorAccion(null);
    try {
      await iniciarFase(tarea.id);
      toast.success(
        `${tarea.ot_numero ?? "La tarea"} · ${tarea.fase_nombre ?? "fase"} en ejecucion`,
      );
    } catch (err) {
      // Una sola señal: ErrorBanner persistente (el POST va con
      // silenciarToast para no duplicar con el toast global).
      setErrorAccion(err.message);
    } finally {
      setAccionId(null);
    }
  };

  const handleFinalizar = async (tarea) => {
    setAccionId(tarea.id);
    setErrorAccion(null);
    setTareasSaliendo((prev) => [
      ...prev.filter((item) => item.id !== tarea.id),
      tarea,
    ]);
    try {
      const { terminada, otEstado, siguienteMia } = await finalizarFase(tarea.id);
      setTareasSaliendo((prev) => [
        ...prev.filter((item) => item.id !== tarea.id),
        { ...tarea, ...terminada, estado: "TERMINADO" },
      ]);
      const referencia = tarea.ot_numero ?? "La tarea";
      if (siguienteMia) {
        toast.success(
          `${referencia} terminada · siguiente fase: ${siguienteMia.fase_nombre ?? "siguiente fase"}`,
        );
      } else if (otEstado === "EN_CALIDAD") {
        toast.success(`${referencia} terminada · OT enviada a Calidad`);
      } else {
        toast.success(`${referencia} terminada · derivada al siguiente puesto`);
      }
    } catch (err) {
      // Una sola señal: ErrorBanner persistente (ver handleIniciar).
      // Además se revierte la animación de salida para que la tarea fallida
      // siga visible en la lista.
      setTareasSaliendo((prev) => prev.filter((item) => item.id !== tarea.id));
      setErrorAccion(err.message);
    } finally {
      setAccionId(null);
    }
  };

  const reintentar = () => {
    setErrorAccion(null);
    recargar();
  };

  const tareaDetalle = detalleId
    ? (otFases.find((fase) => fase.id === detalleId) ?? null)
    : null;

  const errorVisible = errorAccion ?? error;

  return (
    <div className="space-y-4 py-2">
      <Title>Mis tareas</Title>
      <header>
        <h1 className="text-h1 text-ink">Mis tareas</h1>
        <p className="mt-1 text-body text-text-secondary">
          Tareas en cola y en ejecucion.
        </p>
      </header>

      {errorVisible && !cargando && (
        <ErrorBanner
          message={errorVisible}
          retryLabel="Recargar lista"
          onRetry={reintentar}
        />
      )}

      {cargando ? (
        // Desviacion consciente de la spec §7.1 (que pide "spinner centrado"
        // para Operario): se usan skeletons con la misma densidad de la card
        // real para evitar el salto de layout al cargar. Anotado en el PR.
        <ul className="grid grid-cols-1 gap-4" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index}>
              <SkeletonCard rows={4} />
            </li>
          ))}
        </ul>
      ) : tareasVisibles.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No hay tareas asignadas"
          description="Cuando Produccion te derive una fase, aparecera aqui."
          action={
            <Button
              variant="secondary"
              size="lg"
              onClick={reintentar}
              className="mt-2 min-h-[56px] w-full"
            >
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              Actualizar
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {tareasVisibles.map((tarea) => {
            const salida = tarea.estado === "TERMINADO";
            return (
            <li key={tarea.id}>
              <TaskCardMobile
                tarea={tarea}
                accionEnCurso={accionId === tarea.id}
                salida={salida}
                otraEnEjecucion={hayEnEjecucion}
                onIniciar={handleIniciar}
                onFinalizar={handleFinalizar}
                onSalidaCompleta={handleSalidaCompleta}
                onVerDetalle={(item) => setDetalleId(item.id)}
              />
            </li>
            );
          })}
        </ul>
      )}
      <TaskDetailModal
        key={detalleId}
        tarea={tareaDetalle}
        open={detalleId !== null}
        onClose={() => setDetalleId(null)}
      />
    </div>
  );
};
