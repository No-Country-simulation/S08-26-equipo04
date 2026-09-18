import { useMemo, useState } from "react";
import { ClipboardList, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useOtFases } from "../../hooks/useOtFases";
import {
  Button,
  EmptyState,
  ErrorBanner,
  LoadingSpinner,
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

  const tareas = useMemo(
    () =>
      otFases
        .filter((fase) => ESTADOS_ACTIVOS.includes(fase.estado))
        .sort((a, b) => {
          if (a.estado !== b.estado) return a.estado === "EN_EJECUCION" ? -1 : 1;
          return a.numero_secuencia - b.numero_secuencia;
        }),
    [otFases],
  );

  const handleIniciar = async (tarea) => {
    setAccionId(tarea.id);
    setErrorAccion(null);
    try {
      await iniciarFase(tarea.id);
      toast.success(
        `${tarea.ot_numero ?? "La tarea"} · ${tarea.fase_nombre ?? "fase"} en ejecucion`,
      );
    } catch (err) {
      setErrorAccion(err.message);
      toast.error(err.message);
    } finally {
      setAccionId(null);
    }
  };

  const handleFinalizar = async (tarea) => {
    setAccionId(tarea.id);
    setErrorAccion(null);
    try {
      const { otEstado } = await finalizarFase(tarea.id);
      const referencia = tarea.ot_numero ?? "La tarea";
      if (otEstado === "EN_CALIDAD") {
        toast.success(`${referencia} terminada · OT enviada a Calidad`);
      } else {
        toast.success(`${referencia} terminada`);
      }
    } catch (err) {
      setErrorAccion(err.message);
      toast.error(err.message);
    } finally {
      setAccionId(null);
    }
  };

  const reintentar = () => {
    setErrorAccion(null);
    recargar();
  };

  const tareaDetalle = detalleId
    ? otFases.find((fase) => fase.id === detalleId) ?? null
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
        <ErrorBanner message={errorVisible} onRetry={reintentar} />
      )}

      {cargando ? (
        <LoadingSpinner label="Cargando tareas" size="lg" />
      ) : tareas.length === 0 ? (
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
          {tareas.map((tarea) => (
            <li key={tarea.id}>
              <TaskCardMobile
                tarea={tarea}
                accionEnCurso={accionId === tarea.id}
                onIniciar={handleIniciar}
                onFinalizar={handleFinalizar}
                onVerDetalle={(item) => setDetalleId(item.id)}
              />
            </li>
          ))}
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
