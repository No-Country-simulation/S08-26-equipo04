import { useEffect, useMemo, useRef, useState } from "react";
import { addMinutes, differenceInMinutes, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  extractApiMessage,
  listarAdjuntos,
  listarNotasFase,
  verAdjunto,
} from "../../api";
import { mensajeErrorAdjunto } from "../../utils/adjuntos";
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
    const fecha = typeof value === "string" ? parseISO(value) : value;
    return format(fecha, "d MMM yyyy · HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const extensionDe = (nombre, fallback) => {
  const base = nombre ?? "";
  const partes = base.split(".");
  if (partes.length > 1 && partes[partes.length - 1]) {
    return partes[partes.length - 1].toUpperCase();
  }
  return (fallback ?? "").toUpperCase() || "Archivo";
};

// Minutos que sigue viva la URL del blob: la pestaña que la abrio ya la
// cargo, pero revocarla de inmediato la rompe.
const REVOCACION_MS = 60_000;

// El backend agrupa las notas por origen (OrigenNota) y siempre manda las dos
// claves.
const mapNotas = (data) => {
  const agrupadas = data && typeof data === "object" ? data : {};
  const de = (clave) => (Array.isArray(agrupadas[clave]) ? agrupadas[clave] : []);
  return { notasCalidad: de("CALIDAD"), notasProduccion: de("JEFE_PRODUCCION") };
};

/**
 * Detalle de tarea del operario (HU-3.2/3.3/3.4). Solo lectura:
 * vencimiento calculado, adjuntos/planos de la solicitud y notas separadas
 * por origen. Sin mocks y sin cadena OT -> cotizacion: la tarea ya trae
 * `descripcion_pieza`, `cantidad` y `solicitud_id` en el DTO (BE #219), y
 * las notas salen de GET /api/ot-fases/{id}/notas. Un id real jamas debe
 * cruzarse con datos inventados. El operario no puede crear notas.
 */
export const TaskDetailModal = ({ tarea, open, onClose }) => {
  // Los adjuntos vienen de la API (GET /api/solicitudes/{id}/documentos),
  // con el solicitud_id que ya trae la tarea. El estado guarda a que
  // solicitud pertenece cada respuesta para no necesitar setState dentro
  // del efecto.
  const [adjuntosState, setAdjuntosState] = useState({
    solicitudId: null,
    lista: [],
    error: null,
  });
  const [versionAdjuntos, setVersionAdjuntos] = useState(0);
  const [abriendoId, setAbriendoId] = useState(null);
  const [errorDocumento, setErrorDocumento] = useState(null);
  // Notas de la fase (GET /api/ot-fases/{id}/notas), con la misma proteccion
  // contra respuestas de otra tarea.
  const [notasState, setNotasState] = useState({
    otFaseId: null,
    notasCalidad: [],
    notasProduccion: [],
    error: null,
  });
  const [versionNotas, setVersionNotas] = useState(0);
  const blobsAbiertos = useRef([]);

  const otFaseId = tarea?.id ?? null;
  const esDeEstaFase = notasState.otFaseId === otFaseId;
  const notasCalidad = esDeEstaFase ? notasState.notasCalidad : [];
  const notasProduccion = esDeEstaFase ? notasState.notasProduccion : [];
  const errorNotas = esDeEstaFase ? notasState.error : null;
  const cargandoNotas = open && otFaseId != null && !esDeEstaFase;

  useEffect(() => {
    if (!open || otFaseId == null) return undefined;
    let cancelado = false;
    listarNotasFase(otFaseId).then(
      (data) => {
        if (cancelado) return;
        setNotasState({ otFaseId, ...mapNotas(data), error: null });
      },
      (err) => {
        if (cancelado) return;
        setNotasState({
          otFaseId,
          notasCalidad: [],
          notasProduccion: [],
          error: extractApiMessage(err, "No se pudieron cargar las notas."),
        });
      },
    );
    return () => {
      cancelado = true;
    };
  }, [open, otFaseId, versionNotas]);

  // BE #219: la tarea ya trae el solicitud_id, sin resolver la cadena
  // OT -> cotizacion -> solicitud.
  const solicitudId = tarea?.solicitud_id ?? tarea?.solicitudId ?? null;
  const esDeEstaSolicitud = adjuntosState.solicitudId === solicitudId;
  const adjuntos = esDeEstaSolicitud ? adjuntosState.lista : [];
  const errorAdjuntos = esDeEstaSolicitud ? adjuntosState.error : null;
  const cargandoAdjuntos =
    open && solicitudId != null && !esDeEstaSolicitud;

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

  const descargarDocumento = async (adjunto) => {
    setAbriendoId(adjunto.id);
    setErrorDocumento(null);
    try {
      const blob = await verAdjunto(adjunto.id);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = adjunto.nombre_original ?? `documento-${adjunto.id}`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        blobsAbiertos.current = blobsAbiertos.current.filter(
          (item) => item.url !== url,
        );
      }, REVOCACION_MS);
      blobsAbiertos.current = [...blobsAbiertos.current, { url, timer }];
    } catch (err) {
      setErrorDocumento(
        await mensajeErrorAdjunto(err, "No se pudo descargar el documento."),
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

  const reintentarNotas = () => {
    setNotasState({
      otFaseId: null,
      notasCalidad: [],
      notasProduccion: [],
      error: null,
    });
    setVersionNotas((v) => v + 1);
  };

  const reintentar = () => {
    setAdjuntosState({ solicitudId: null, lista: [], error: null });
    setVersionAdjuntos((v) => v + 1);
  };

  const estado = tarea
    ? estadoConfig[tarea.estado] || { variant: "queue", label: tarea.estado }
    : null;

  const renderContenido = () => {
    if (!tarea) {
      return (
        <EmptyState
          title="Sin detalle"
          description="No se pudo cargar la tarea seleccionada."
        />
      );
    }
    // BE #219: pieza y cantidad ya vienen en la tarea, sin cadena OT ->
    // cotizacion. Vencimiento de la tarea o calculado.
    const descripcionPieza = tarea.descripcion_pieza ?? null;
    const cantidad = tarea.cantidad ?? null;
    const venceTexto =
      tarea.fecha_vencimiento != null
        ? formatFecha(tarea.fecha_vencimiento)
        : vencimiento
          ? formatFecha(vencimiento.limite.toISOString())
          : null;
    const sinInstrucciones =
      !cargandoNotas &&
      !errorNotas &&
      notasCalidad.length === 0 &&
      notasProduccion.length === 0;

    return (
      <div className="space-y-4">
        <section
          aria-labelledby="detalle-datos"
          className="rounded-xl border border-border bg-surface p-4"
        >
          <h3
            id="detalle-datos"
            className="text-body font-semibold text-ink"
          >
            Datos del trabajo
          </h3>
          {descripcionPieza && (
            <p className="mt-2 text-body text-ink">{descripcionPieza}</p>
          )}
          {cantidad != null && (
            <p className="mt-1 text-body text-ink">{cantidad} piezas</p>
          )}
          {tarea.tiempo_estimado_minutos != null && (
            <div className="mt-3">
              <p className="text-label text-text-muted">Tiempo estimado</p>
              <p className="mt-0.5 text-body font-semibold text-ink">
                {tarea.tiempo_estimado_minutos} min
              </p>
            </div>
          )}
          {venceTexto && (
            <div className="mt-3">
              <p className="text-label text-text-muted">Vence</p>
              <p className="mt-0.5 text-body font-semibold text-ink">
                {venceTexto}
              </p>
            </div>
          )}
        </section>

        <section
          aria-labelledby="detalle-instrucciones"
          className="rounded-xl border border-border bg-surface p-4"
        >
          <h3
            id="detalle-instrucciones"
            className="text-body font-semibold text-ink"
          >
            Instrucciones
          </h3>
          {cargandoNotas && (
            <p className="mt-2 text-label text-text-secondary">
              Cargando instrucciones...
            </p>
          )}
          {!cargandoNotas && errorNotas && (
            <ErrorBanner
              message={errorNotas}
              onRetry={reintentarNotas}
              className="mt-2"
            />
          )}
          {sinInstrucciones && (
            <p className="mt-2 text-label text-text-secondary">
              Sin instrucciones registradas en esta fase.
            </p>
          )}
          {!cargandoNotas && !errorNotas && !sinInstrucciones && (
            <div className="mt-3 space-y-4">
              {notasProduccion.length > 0 && (
                <div className="border-l-[3px] border-border pl-3">
                  <p className="text-label font-medium text-text-muted">
                    Jefe de Producción
                  </p>
                  {notasProduccion.map((nota) => (
                    <p
                      key={nota.id}
                      className="mt-1 text-body leading-relaxed text-ink"
                    >
                      {nota.contenido}
                    </p>
                  ))}
                </div>
              )}
              {notasCalidad.length > 0 && (
                <div className="border-l-[3px] border-border pl-3">
                  <p className="text-label font-medium text-text-muted">
                    Calidad
                  </p>
                  {notasCalidad.map((nota) => (
                    <p
                      key={nota.id}
                      className="mt-1 text-body leading-relaxed text-ink"
                    >
                      {nota.contenido}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section
          aria-labelledby="detalle-documentos"
          className="rounded-xl border border-border bg-surface p-4"
        >
          <h3
            id="detalle-documentos"
            className="text-body font-semibold text-ink"
          >
            Documentos
          </h3>
          {solicitudId == null && (
            <p className="mt-2 text-label text-text-secondary">
              La tarea no trae solicitud asociada: sin documentos para mostrar.
            </p>
          )}
          {solicitudId != null && cargandoAdjuntos && (
            <LoadingSpinner
              label="Cargando documentos"
              size="sm"
              className="min-h-0 py-4"
            />
          )}
          {solicitudId != null && !cargandoAdjuntos && errorAdjuntos && (
            <ErrorBanner
              message={errorAdjuntos}
              onRetry={reintentar}
              className="mt-2"
            />
          )}
          {solicitudId != null &&
            !cargandoAdjuntos &&
            !errorAdjuntos &&
            adjuntos.length === 0 && (
              <p className="mt-2 text-label text-text-secondary">
                Sin documentos disponibles por el momento.
              </p>
            )}
          {solicitudId != null &&
            !cargandoAdjuntos &&
            !errorAdjuntos &&
            adjuntos.length > 0 && (
            <ul className="mt-2 space-y-4">
              {adjuntos.map((adjunto) => (
                <li key={adjunto.id}>
                  <p className="truncate text-body text-ink">
                    {adjunto.nombre_original}
                  </p>
                  <p className="mt-0.5 text-label uppercase text-text-muted">
                    {extensionDe(
                      adjunto.nombre_original,
                      adjunto.tipo_archivo,
                    )}
                  </p>
                  <div className="mt-1.5 flex items-center gap-6">
                    <Button
                      variant="discrete"
                      size="sm"
                      className="!px-0"
                      loading={abriendoId === adjunto.id}
                      aria-label={`Abrir ${adjunto.nombre_original}`}
                      onClick={() => verDocumento(adjunto)}
                    >
                      Abrir
                    </Button>
                    <Button
                      variant="discrete"
                      size="sm"
                      className="!px-0"
                      loading={abriendoId === adjunto.id}
                      aria-label={`Descargar ${adjunto.nombre_original}`}
                      onClick={() => descargarDocumento(adjunto)}
                    >
                      Descargar
                    </Button>
                  </div>
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
      </div>
    );
  };

  // El encabezado del modal replica la cabecera del diseño: OT en teal,
  // fase en grande y badge con punto al lado.
  const tituloModal = tarea ? (
    <span className="block">
      <span className="block text-label font-semibold text-primary">
        {tarea.ot_numero ?? "—"}
      </span>
      <span className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-h1 text-ink">
          {tarea.fase_nombre ?? "Fase sin nombre"}
        </span>
        {estado && (
          <Badge variant={estado.variant} className="whitespace-nowrap">
            <span
              className="h-1.5 w-1.5 rounded-full bg-current"
              aria-hidden="true"
            />
            {estado.label}
          </Badge>
        )}
      </span>
    </span>
  ) : (
    "Detalle de tarea"
  );

  return (
    <Modal open={open} onClose={onClose} title={tituloModal}>
      <div className="max-h-[70vh] overflow-y-auto">{renderContenido()}</div>
    </Modal>
  );
};
