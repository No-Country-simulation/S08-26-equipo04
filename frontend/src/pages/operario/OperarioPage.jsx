import { useEffect, useMemo, useState } from "react";
import { ClipboardList, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
  const { otFases, iniciarFase, finalizarFase } = useOtFases();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [accionId, setAccionId] = useState(null);
  const [detalleId, setDetalleId] = useState(null);

  const cargar = () => {
    setCargando(true);
    setError(null);
    // El provider es sincrono (mock); se simula la latencia de red para
    // ejercitar los estados de UI segun spec §7.1.
    setTimeout(() => setCargando(false), 400);
  };

  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Los ids de usuario del mock de auth no coinciden con los operario_id
  // del mock de ot-fases; se filtra por nombre (consistente en ambos mocks)
  // hasta que el backend estabilice los ids (GET /api/ot-fases ya filtra
  // por el operario logueado via JWT).
  const tareas = useMemo(() => {
    if (!user) return [];
    return otFases
      .filter(
        (fase) =>
          ESTADOS_ACTIVOS.includes(fase.estado) &&
          fase.operario_nombre === user.nombre,
      )
      .sort((a, b) => {
        if (a.estado !== b.estado) return a.estado === "EN_EJECUCION" ? -1 : 1;
        return a.numero_secuencia - b.numero_secuencia;
      });
  }, [otFases, user]);

  const handleIniciar = async (tarea) => {
    setAccionId(tarea.id);
    setError(null);
    try {
      await iniciarFase(tarea.id);
      toast.success(`${tarea.ot_numero} · ${tarea.fase_nombre} en ejecucion`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setAccionId(null);
    }
  };

  const handleFinalizar = async (tarea) => {
    setAccionId(tarea.id);
    setError(null);
    try {
      const { siguiente } = await finalizarFase(tarea.id);
      if (siguiente) {
        // La fase siguiente puede pertenecer a otro operario: en ese caso
        // la lista propia queda vacia y el toast debe decir a quien se derivo.
        const esMia = siguiente.operario_nombre === user?.nombre;
        toast.success(
          esMia
            ? `${tarea.ot_numero} terminada · siguiente fase: ${siguiente.fase_nombre}`
            : `${tarea.ot_numero} terminada · derivada a ${siguiente.operario_nombre} (${siguiente.fase_nombre})`,
        );
      } else {
        toast.success(`${tarea.ot_numero} terminada · OT enviada a Calidad`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setAccionId(null);
    }
  };

  const reintentar = () => cargar();

  const tareaDetalle = detalleId
    ? otFases.find((fase) => fase.id === detalleId) ?? null
    : null;

  return (
    <div className="space-y-4 py-2">
      <Title>Mis tareas</Title>
      <header>
        <h1 className="text-h1 text-ink">Mis tareas</h1>
        <p className="mt-1 text-body text-text-secondary">
          Tareas en cola y en ejecucion.
        </p>
      </header>

      {error && !cargando && (
        <ErrorBanner message={error} onRetry={reintentar} />
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
