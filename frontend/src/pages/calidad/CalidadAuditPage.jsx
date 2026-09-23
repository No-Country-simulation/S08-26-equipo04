import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuditorias } from "../../hooks/useAuditorias";
import {
  Badge,
  Button,
  Card,
  CardTitle,
  EmptyState,
  Title,
} from "../../components/ui";
import { formatDateTime } from "../../api/helpers";
import {
  CRITERIOS_CHECKLIST,
  OPCIONES_CHECKLIST,
  VEREDICTOS,
} from "./checklist";

// Iconos en lugar de emojis: consistentes en Android/iOS y legibles
// con lector de pantalla. Mismos colores semánticos del formulario
// anterior (verde = cumple, rojo = no cumple, gris = no aplica).
const OPCION_ICONOS = {
  CUMPLE: Check,
  NO_CUMPLE: X,
  NO_APLICA: Minus,
};

const OPCION_ESTILOS = {
  CUMPLE: "border-success bg-success-light text-success",
  NO_CUMPLE: "border-error bg-error-light text-error",
  NO_APLICA: "border-border bg-canvas text-text-muted",
};

const VEREDICTO_ICONOS = {
  CONFORME: Check,
  NO_CONFORME: X,
};

const VEREDICTO_ESTILOS = {
  CONFORME: "border-success bg-success-light text-success",
  NO_CONFORME: "border-error bg-error-light text-error",
};

const HistorialAuditorias = ({ historial }) => {
  if (historial.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardTitle className="text-label font-medium">
        Auditorías previas ({historial.length})
      </CardTitle>
      <ul className="mt-3 space-y-2">
        {historial.map((auditoria) => (
          <li
            key={auditoria.id}
            className="flex flex-wrap items-center gap-2 text-body text-text-secondary"
          >
            <Badge
              variant={
                auditoria.resultado === "CONFORME" ? "approved" : "production"
              }
              type="inline"
            >
              {auditoria.resultado === "CONFORME" ? "Conforme" : "No conforme"}
            </Badge>
            <span>
              {auditoria.fecha_veredicto
                ? formatDateTime(auditoria.fecha_veredicto)
                : "—"}
            </span>
            {auditoria.observaciones_generales && (
              <span className="w-full text-metadata text-text-muted">
                {auditoria.observaciones_generales}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export const CalidadAuditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { obtenerOrdenTrabajo, auditoriasDeOT, registrarAuditoria } =
    useAuditorias();

  const [respuestas, setRespuestas] = useState({});
  const [veredicto, setVeredicto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Stepper mobile-first (1 criterio por pantalla, como en planta):
  // pasos 0..N-1 = criterios, paso N = veredicto + observaciones + envío.
  const [paso, setPaso] = useState(0);

  const orden = useMemo(() => obtenerOrdenTrabajo(id), [obtenerOrdenTrabajo, id]);
  const historial = useMemo(
    () => (orden ? auditoriasDeOT(orden.id) : []),
    [auditoriasDeOT, orden],
  );

  const volver = () => navigate("/calidad");

  const totalPasos = CRITERIOS_CHECKLIST.length + 1;
  const esPasoCierre = paso === CRITERIOS_CHECKLIST.length;
  const criterioActual = esPasoCierre ? null : CRITERIOS_CHECKLIST[paso];
  const respondidas = Object.keys(respuestas).length;
  const puedeGuardar =
    respondidas === CRITERIOS_CHECKLIST.length &&
    (veredicto === "CONFORME" ||
      (veredicto === "NO_CONFORME" && observaciones.trim().length > 0));

  const elegirRespuesta = (itemNumero, valor) => {
    setRespuestas((prev) => ({ ...prev, [itemNumero]: valor }));
  };

  const irAnterior = () => setPaso((prev) => Math.max(0, prev - 1));
  const irSiguiente = () =>
    setPaso((prev) => Math.min(totalPasos - 1, prev + 1));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!orden) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await registrarAuditoria({
        orden_trabajo_id: orden.id,
        resultado: veredicto,
        checklist: respuestas,
        observaciones,
      });

      toast.success(
        veredicto === "CONFORME"
          ? `${orden.numero_ot} derivada a Despacho`
          : `${orden.numero_ot} derivada al Jefe de producción`,
      );
      volver();
    } catch (err) {
      const message =
        err?.message || "No se pudo guardar la auditoría. Reintente.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orden) {
    return (
      <div className="space-y-4 py-2">
        <Title>Orden no encontrada</Title>
        <EmptyState
          icon={ShieldCheck}
          title="Orden no encontrada"
          description="La orden de trabajo solicitada no existe."
          action={<Button onClick={volver}>Volver al panel</Button>}
        />
      </div>
    );
  }

  if (orden.estado !== "EN_CALIDAD") {
    return (
      <div className="space-y-4 py-2">
        <Title>Auditoría no disponible</Title>
        <EmptyState
          icon={ShieldCheck}
          title="Esta OT ya no está en control de calidad"
          description={`La orden ${orden.numero_ot} se encuentra en estado ${orden.estado}. Solo pueden auditarse órdenes pendientes de control.`}
          action={<Button onClick={volver}>Volver al panel</Button>}
        />
        <HistorialAuditorias historial={historial} />
      </div>
    );
  }

  const progreso = Math.round(((paso + 1) / totalPasos) * 100);

  return (
    <div className="space-y-4 py-2">
      <Title>{`Auditoría ${orden.numero_ot}`}</Title>

      <div>
        <button
          type="button"
          onClick={volver}
          className="inline-flex min-h-[48px] items-center gap-1 text-label font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a Control de calidad
        </button>
        <h1 className="mt-1 text-h1 text-ink">
          Auditoría {orden.numero_ot}
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          {orden.cliente_razon_social} · {orden.descripcion_pieza} · Cantidad{" "}
          {orden.cantidad ?? "—"}
        </p>
      </div>

      <HistorialAuditorias historial={historial} />

      {/* Progreso del checklist: mismo patrón de encabezado simple que
          las tarjetas de operario, con barra accesible. */}
      <Card className="w-full p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-label font-semibold text-ink">
            {esPasoCierre
              ? "Veredicto final"
              : `Punto ${criterioActual.item_numero} de ${CRITERIOS_CHECKLIST.length}`}
          </p>
          <p className="text-label tabular-nums text-text-secondary">
            {paso + 1} de {totalPasos}
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-canvas"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalPasos}
          aria-valuenow={paso + 1}
          aria-label="Progreso del checklist"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="mt-2 text-metadata text-text-muted">
          {respondidas} de {CRITERIOS_CHECKLIST.length} puntos respondidos
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!esPasoCierre ? (
          <Card
            className="w-full p-4 sm:p-5"
            key={criterioActual.item_numero}
            data-testid={`checklist-paso-${criterioActual.item_numero}`}
          >
            <fieldset className="space-y-4">
              <legend className="text-h2 text-ink">
                {criterioActual.item_numero}. {criterioActual.criterio_nombre}
              </legend>
              <div
                className="grid grid-cols-1 gap-3"
                role="radiogroup"
                aria-label={criterioActual.criterio_nombre}
              >
                {OPCIONES_CHECKLIST.map((opcion) => {
                  const Icono = OPCION_ICONOS[opcion.valor];
                  const seleccionada =
                    respuestas[criterioActual.item_numero] === opcion.valor;

                  return (
                    <button
                      key={opcion.valor}
                      type="button"
                      role="radio"
                      aria-checked={seleccionada}
                      onClick={() => {
                        elegirRespuesta(
                          criterioActual.item_numero,
                          opcion.valor,
                        );
                      }}
                      className={`flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border text-base font-semibold transition-colors ${
                        seleccionada
                          ? OPCION_ESTILOS[opcion.valor]
                          : "border-border bg-surface text-text-secondary hover:bg-canvas"
                      }`}
                    >
                      <Icono className="h-5 w-5" aria-hidden="true" />
                      {opcion.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </Card>
        ) : (
          <Card className="w-full space-y-5 p-4 sm:p-5">
            <fieldset className="space-y-3">
              <legend className="text-h2 text-ink">
                Veredicto final <span className="text-error">*</span>
              </legend>
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                role="radiogroup"
                aria-label="Veredicto final"
              >
                {VEREDICTOS.map((opcion) => {
                  const Icono = VEREDICTO_ICONOS[opcion.valor];
                  const seleccionado = veredicto === opcion.valor;

                  return (
                    <button
                      key={opcion.valor}
                      type="button"
                      role="radio"
                      aria-checked={seleccionado}
                      onClick={() => setVeredicto(opcion.valor)}
                      className={`flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border text-base font-semibold transition-colors ${
                        seleccionado
                          ? VEREDICTO_ESTILOS[opcion.valor]
                          : "border-border bg-surface text-text-secondary hover:bg-canvas"
                      }`}
                    >
                      <Icono className="h-5 w-5" aria-hidden="true" />
                      {opcion.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label
                htmlFor="observaciones"
                className="block text-label text-text-secondary"
              >
                Observaciones{" "}
                {veredicto === "NO_CONFORME" && (
                  <span className="text-error">*</span>
                )}
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                className="input min-h-[56px]"
                placeholder={
                  veredicto === "NO_CONFORME"
                    ? "Describa el defecto observado…"
                    : "Observaciones opcionales"
                }
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
              />
              {veredicto === "NO_CONFORME" && (
                <p className="text-metadata text-text-muted">
                  Obligatorias para derivar la OT al Jefe de producción.
                </p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="text-metadata text-error">
                {submitError}
              </p>
            )}
          </Card>
        )}

        {/* Navegación ANTERIOR / PRÓXIMO con targets táctiles grandes,
            igual que las acciones del operario. */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={irAnterior}
            disabled={paso === 0}
            className="min-h-[56px] w-full text-base font-semibold"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Anterior
          </Button>
          {!esPasoCierre ? (
            <Button
              type="button"
              size="lg"
              onClick={irSiguiente}
              disabled={!respuestas[criterioActual.item_numero]}
              className="min-h-[56px] w-full text-base font-semibold"
            >
              Próximo
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              disabled={!puedeGuardar}
              className="min-h-[56px] w-full text-base font-semibold"
            >
              Guardar veredicto
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
