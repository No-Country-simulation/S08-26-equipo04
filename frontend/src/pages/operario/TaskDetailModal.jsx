import { useEffect, useMemo, useRef, useState } from "react";
import { addMinutes, differenceInMinutes, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  MessagesSquare,
} from "lucide-react";
import { mocks } from "../../mocks";
import { extractApiMessage, listarAdjuntos, verAdjunto } from "../../api";
import { formatBytes, mensajeErrorAdjunto } from "../../utils/adjuntos";
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  LoadingSpinner,
  Modal,
} from "../../components/ui";

const estadoConfig = {
  EN_COLA: { variant: "queue", label: "En cola" },
  EN_EJECUCION: { variant: "production", label: "En ejecucion" },
  TERMINADO: { variant: "completed", label: "Terminada" },
};

const formatFecha = (value) => {
  try {
    return format(parseISO(value), "dd/MM/yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
};

// Minutos que sigue viva la URL del blob: la pestaña que la abrio ya la
// cargo, pero revocarla de inmediato la rompe.
const REVOCACION_MS = 60_000;

/**
 * Detalle de tarea del operario (HU-3.2/3.3/3.4). Solo lectura:
 * adjuntos/planos de la solicitud (API), vencimiento calculado y notas
 * separadas por origen. El operario no puede crear notas.
 */
export const TaskDetailModal = ({ tarea, open, onClose }) => {
  // Los adjuntos vienen de la API (GET /api/solicitudes/{id}/documentos).
  // El estado guarda a que solicitud pertenece cada respuesta para no
  // necesitar setState dentro del efecto.
  const [adjuntosState, setAdjuntosState] = useState({
    solicitudId: null,
    lista: [],
    error: null,
  });
  const [versionAdjuntos, setVersionAdjuntos] = useState(0);
  const [abriendoId, setAbriendoId] = useState(null);
  const [errorDocumento, setErrorDocumento] = useState(null);
  const blobsAbiertos = useRef([]);

  const detalle = useMemo(() => {
    if (!tarea) return null;
    const ot = mocks.ordenesTrabajo.find(
      (item) => item.id === tarea.orden_trabajo_id,
    );
    const cotizacion = ot
      ? mocks.cotizaciones.find((item) => item.id === ot.cotizacion_id)
      : null;
    const notas = mocks.notas.filter(
      (item) => item.ot_fase_id === tarea.id,
    );
    const notasCalidad = notas.filter((item) => item.origen === "CALIDAD");
    const notasProduccion = notas.filter((item) => item.origen !== "CALIDAD");
    return {
      ot,
      cotizacion,
      solicitudId: cotizacion?.solicitud_id ?? null,
      notasCalidad,
      notasProduccion,
    };
  }, [tarea]);

  const solicitudId = detalle?.solicitudId ?? null;
  const esDeEstaSolicitud = adjuntosState.solicitudId === solicitudId;
  const adjuntos = esDeEstaSolicitud ? adjuntosState.lista : [];
  const errorAdjuntos = esDeEstaSolicitud ? adjuntosState.error : null;
  const cargandoAdjuntos = open && solicitudId != null && !esDeEstaSolicitud;

  useEffect(() => {
    if (!open || solicitudId == null) return undefined;
    let cancelado = false;
    listarAdjuntos(solicitudId).then(
      (lista) => {
        if (cancelado) return;
        setAdjuntosState({ solicitudId, lista, error: null });
      },
      (err) => {
        if (cancelado) return;
        setAdjuntosState({
          solicitudId,
          lista: [],
          error: extractApiMessage(err, "No se pudieron cargar los adjuntos."),
        });
      },
    );
    return () => {
      cancelado = true;
    };
  }, [open, solicitudId, versionAdjuntos]);

  // Libera los object URLs de los documentos que se abrieron.
  useEffect(
    () => () => {
      blobsAbiertos.current.forEach((item) => {
        clearTimeout(item.timer);
        URL.revokeObjectURL(item.url);
      });
      blobsAbiertos.current = [];
    },
    [],
  );

  const verDocumento = async (adjunto) => {
    setAbriendoId(adjunto.id);
    setErrorDocumento(null);
    try {
      const blob = await verAdjunto(adjunto.id);
      const url = URL.createObjectURL(blob);
      const ventana = window.open(url, "_blank");
      if (ventana) {
        ventana.opener = null;
      } else {
        // Popup bloqueado: se reintenta con un ancla.
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.click();
      }
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        blobsAbiertos.current = blobsAbiertos.current.filter(
          (item) => item.url !== url,
        );
      }, REVOCACION_MS);
      blobsAbiertos.current = [...blobsAbiertos.current, { url, timer }];
    } catch (err) {
      setErrorDocumento(
        await mensajeErrorAdjunto(err, "No se pudo abrir el documento."),
      );
    } finally {
      setAbriendoId(null);
    }
  };

  const vencimiento = useMemo(() => {
    if (!tarea?.tiempo_estimado_minutos) return null;
    // El tiempo estimado lo carga el Jefe; corre desde que la tarea
    // ingresa a la cola (fecha_inicio_real si ya inicio, si no ahora).
    const inicio = tarea.fecha_inicio_real
      ? parseISO(tarea.fecha_inicio_real)
      : new Date();
    const limite = addMinutes(inicio, tarea.tiempo_estimado_minutos);
    const restantes = differenceInMinutes(limite, new Date());
    return { limite, restantes };
  }, [tarea]);

  const reintentar = () => {
    setAdjuntosState({ solicitudId: null, lista: [], error: null });
    setVersionAdjuntos((v) => v + 1);
  };

  const estado = tarea
    ? estadoConfig[tarea.estado] || { variant: "queue", label: tarea.estado }
    : null;

  const renderContenido = () => {
    if (!tarea || !detalle) {
      return (
        <EmptyState
          title="Sin detalle"
          description="No se pudo cargar la tarea seleccionada."
        />
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-metadata text-text-muted">{tarea.ot_numero}</p>
            <p className="text-label text-text-secondary">
              Fase {tarea.numero_secuencia}
              {detalle.ot ? ` · ${detalle.ot.cliente_razon_social}` : ""}
            </p>
          </div>
          <Badge variant={estado.variant} className="shrink-0 whitespace-nowrap">{estado.label}</Badge>
        </div>

        <section aria-labelledby="detalle-vencimiento">
          <h3
            id="detalle-vencimiento"
            className="flex items-center gap-2 text-label font-semibold text-ink"
          >
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Vencimiento
          </h3>
          {vencimiento ? (
            <div className="mt-2 rounded-xl bg-canvas p-3 text-label text-text-secondary">
              <p>Tiempo estimado: {tarea.tiempo_estimado_minutos} min</p>
              <p>Limite: {formatFecha(vencimiento.limite.toISOString())}</p>
              <p className="mt-1 font-semibold text-ink">
                {vencimiento.restantes >= 0
                  ? `Te quedan ${vencimiento.restantes} min`
                  : `Vencida hace ${Math.abs(vencimiento.restantes)} min`}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-label text-text-secondary">
              Sin tiempo estimado cargado.
            </p>
          )}
          {tarea.fecha_vencimiento && (
            <p className="mt-1 text-label text-text-secondary">
              Vence: {formatFecha(tarea.fecha_vencimiento)}
            </p>
          )}
        </section>

        <section aria-labelledby="detalle-adjuntos">
          <h3
            id="detalle-adjuntos"
            className="flex items-center gap-2 text-label font-semibold text-ink"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Adjuntos de la solicitud
          </h3>
          {cargandoAdjuntos && (
            <LoadingSpinner
              label="Cargando adjuntos"
              size="sm"
              className="min-h-0 py-4"
            />
          )}
          {!cargandoAdjuntos && errorAdjuntos && (
            <ErrorBanner
              message={errorAdjuntos}
              onRetry={reintentar}
              className="mt-2"
            />
          )}
          {!cargandoAdjuntos && !errorAdjuntos && adjuntos.length === 0 && (
            <p className="mt-2 rounded-xl bg-canvas p-3 text-label text-text-secondary">
              Sin adjuntos: esta solicitud no tiene planos ni documentos.
            </p>
          )}
          {!cargandoAdjuntos && !errorAdjuntos && adjuntos.length > 0 && (
            <ul className="mt-2 space-y-2">
              {adjuntos.map((adjunto) => (
                <li
                  key={adjunto.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-canvas p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-label font-medium text-ink">
                      {adjunto.nombre_original}
                    </p>
                    <p className="text-metadata text-text-secondary">
                      {adjunto.tipo_archivo} · {formatBytes(adjunto.tamanio_bytes)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    loading={abriendoId === adjunto.id}
                    aria-label={`Ver ${adjunto.nombre_original}`}
                    onClick={() => verDocumento(adjunto)}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Ver
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {errorDocumento && (
            <p
              role="alert"
              className="mt-2 rounded-lg bg-error-light p-3 text-label text-error"
            >
              {errorDocumento}
            </p>
          )}
        </section>

        <section aria-labelledby="detalle-notas">
          <h3
            id="detalle-notas"
            className="flex items-center gap-2 text-label font-semibold text-ink"
          >
            <MessagesSquare className="h-4 w-4" aria-hidden="true" />
            Notas
          </h3>
          {detalle.notasCalidad.length === 0 &&
          detalle.notasProduccion.length === 0 ? (
            <p className="mt-2 rounded-xl bg-canvas p-3 text-label text-text-secondary">
              Sin notas: no hay notas de Calidad ni de Produccion para esta
              tarea.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {detalle.notasCalidad.length > 0 && (
                <details className="group rounded-xl bg-canvas">
                  <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-2 p-3 text-label font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span className="text-metadata font-semibold uppercase tracking-wide text-text-secondary">
                      Calidad ({detalle.notasCalidad.length})
                    </span>
                    <ChevronDown
                      className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <ul className="space-y-2 px-3 pb-3">
                    {detalle.notasCalidad.map((nota) => (
                      <li
                        key={nota.id}
                        className="rounded-xl bg-surface p-3 text-label text-text-secondary"
                      >
                        <p>{nota.contenido}</p>
                        <p className="mt-1 text-metadata">
                          {nota.usuario_nombre} · {formatFecha(nota.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {detalle.notasProduccion.length > 0 && (
                <details className="group rounded-xl bg-canvas">
                  <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-2 p-3 text-label font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span className="text-metadata font-semibold uppercase tracking-wide text-text-secondary">
                      Produccion ({detalle.notasProduccion.length})
                    </span>
                    <ChevronDown
                      className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <ul className="space-y-2 px-3 pb-3">
                    {detalle.notasProduccion.map((nota) => (
                      <li
                        key={nota.id}
                        className="rounded-xl bg-surface p-3 text-label text-text-secondary"
                      >
                        <p>{nota.contenido}</p>
                        <p className="mt-1 text-metadata">
                          {nota.usuario_nombre} · {formatFecha(nota.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        tarea ? `${tarea.ot_numero} · ${tarea.fase_nombre}` : "Detalle de tarea"
      }
    >
      <div className="max-h-[70vh] overflow-y-auto">{renderContenido()}</div>
    </Modal>
  );
};
