import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { mocks } from "../../mocks";
import { useCotizaciones } from "../../hooks/useCotizaciones";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Field,
  Title,
} from "../../components/ui";
import { SelectorFases } from "../../components/SelectorFases";
import { SecuenciaFaseRow } from "../../components/SecuenciaFaseRow";
import {
  cotizacionSchema,
  cotizacionDefaults,
} from "../../utils/cotizacionSchema";
import { useWatch } from "react-hook-form";

const ESTADOS_SOLO_LECTURA = ["ENVIADA_A_CLIENTE", "APROBADA", "NO_APROBADA"];

export const CotizacionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);
  const { cotizaciones, agregarCotizacion, actualizarCotizacion } =
    useCotizaciones();
  const { solicitudes, obtenerSolicitud } = useSolicitudes();

  const cotizacionExistente = esEdicion
    ? cotizaciones.find((c) => c.id === Number(id))
    : null;

  useEffect(() => {
    if (
      cotizacionExistente &&
      ESTADOS_SOLO_LECTURA.includes(cotizacionExistente.estado)
    ) {
      navigate(`/cotizaciones/${cotizacionExistente.id}`, { replace: true });
    }
  }, [cotizacionExistente, navigate]);

  const solicitudesDisponibles = useMemo(
    () =>
      solicitudes.filter(
        (s) =>
          (s.estado === "PENDIENTE_COTIZACION" || s.estado === "COTIZADA") &&
          !cotizaciones.some((c) => c.solicitud_id === s.id),
      ),
    [solicitudes, cotizaciones],
  );

  const fasesCatalogo = useMemo(() => mocks.fases.filter((f) => f.activo), []);

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(
    cotizacionExistente?.solicitud_id || null,
  );

  const solicitudActual = solicitudSeleccionada
    ? obtenerSolicitud(solicitudSeleccionada)
    : null;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: cotizacionExistente
      ? {
          fases: cotizacionExistente.fases.map((f) => ({
            fase_catalogo_id: f.fase_catalogo_id,
            fase_nombre: f.fase_nombre,
            tiempo_estimado_minutos: f.tiempo_estimado_minutos,
            instrucciones_fase: f.instrucciones_fase,
          })),
          precio_final: cotizacionExistente.precio_final,
          observaciones: cotizacionExistente.observaciones || "",
        }
      : cotizacionDefaults,
  });

  const fases = useWatch({ control, name: "fases" }) ?? [];

  const handleSeleccionarSolicitud = (e) => {
    const solicitudId = Number(e.target.value) || null;
    setSolicitudSeleccionada(solicitudId);
  };

  const handleAgregarFase = (nuevaFase) => {
    const actuales = getValues("fases") ?? [];
    setValue("fases", [...actuales, nuevaFase], { shouldValidate: true });
  };

  const handleActualizarFase = (index, faseActualizada) => {
    const actuales = getValues("fases") ?? [];
    const nuevasFases = [...actuales];
    nuevasFases[index] = faseActualizada;
    setValue("fases", nuevasFases, { shouldValidate: true });
  };

  const handleEliminarFase = (index) => {
    const actuales = getValues("fases") ?? [];
    const nuevasFases = actuales.filter((_, i) => i !== index);
    setValue("fases", nuevasFases, { shouldValidate: true });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const actuales = getValues("fases") ?? [];
    const nuevasFases = [...actuales];
    const [movida] = nuevasFases.splice(result.source.index, 1);
    nuevasFases.splice(result.destination.index, 0, movida);
    setValue("fases", nuevasFases, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      if (esEdicion) {
        actualizarCotizacion(Number(id), data);
        toast.success(
          "Cotización actualizada (solo local, sin endpoint de edición).",
        );
      } else {
        const solicitud = obtenerSolicitud(solicitudSeleccionada);
        await agregarCotizacion({
          solicitud_id: solicitudSeleccionada,
          precio_final: data.precio_final,
          fases: data.fases.map((fase, index) => ({
            ...fase,
            numero_secuencia: fase.numero_secuencia ?? index + 1,
          })),
          observaciones: data.observaciones || "",
          solicitud_numero: solicitud?.numero_solicitud ?? null,
          cliente_razon_social: solicitud?.cliente_razon_social ?? null,
        });
        toast.success("Cotización creada correctamente");
      }
      navigate("/cotizaciones");
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.message || "No se pudo guardar la cotización.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Title>{esEdicion ? "Editar cotización" : "Nueva cotización"}</Title>
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/cotizaciones")}
          className="mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-label text-primary">Cotizaciones</p>
          <h1 className="mt-1 text-h1 text-ink">
            {esEdicion ? "Editar cotizacion" : "Nueva cotizacion"}
          </h1>
          {cotizacionExistente && (
            <p className="mt-1 text-body text-text-secondary">
              {cotizacionExistente.numero_cotizacion} —{" "}
              {cotizacionExistente.cliente_razon_social ??
                solicitudActual?.cliente_razon_social ??
                ""}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!esEdicion && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitud asociada</CardTitle>
            </CardHeader>

            <div className="flex flex-col">
              <label
                htmlFor="solicitud_id"
                className="text-metadata text-text-muted"
              >
                Seleccionar solicitud
              </label>
              <select
                id="solicitud_id"
                name="solicitud_id"
                value={solicitudSeleccionada || ""}
                onChange={handleSeleccionarSolicitud}
                className="input"
              >
                <option value="">Seleccionar una solicitud...</option>
                {solicitudesDisponibles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.numero_solicitud} — {s.cliente_razon_social} (
                    {s.descripcion_pieza})
                  </option>
                ))}
              </select>
            </div>

            {solicitudActual && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-metadata text-text-muted">Cliente</p>
                  <p className="text-body font-medium text-ink">
                    {solicitudActual.cliente_razon_social}
                  </p>
                </div>
                <div>
                  <p className="text-metadata text-text-muted">Pieza</p>
                  <p className="text-body font-medium text-ink">
                    {solicitudActual.descripcion_pieza}
                  </p>
                </div>
                <div>
                  <p className="text-metadata text-text-muted">Cantidad</p>
                  <p className="text-body font-medium text-ink">
                    {solicitudActual.cantidad} unidades
                  </p>
                </div>
                <div>
                  <p className="text-metadata text-text-muted">
                    Fecha esperada
                  </p>
                  <p className="text-body font-medium text-ink">
                    {solicitudActual.fecha_esperada_entrega}
                  </p>
                </div>
                {solicitudActual.notas_comerciales && (
                  <div className="sm:col-span-2">
                    <p className="text-metadata text-text-muted">
                      Notas comerciales
                    </p>
                    <p className="text-body text-text-secondary">
                      {solicitudActual.notas_comerciales}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {esEdicion && cotizacionExistente && (
          <Card>
            <CardHeader>
              <CardTitle>Informacion de la solicitud</CardTitle>
            </CardHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-metadata text-text-muted">Solicitud</p>
                <p className="text-body font-medium text-ink">
                  {cotizacionExistente.solicitud_numero ??
                    solicitudActual?.numero_solicitud ??
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-metadata text-text-muted">Cliente</p>
                <p className="text-body font-medium text-ink">
                  {cotizacionExistente.cliente_razon_social ??
                    solicitudActual?.cliente_razon_social ??
                    "—"}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Secuencia de fases</CardTitle>
          </CardHeader>

          <div className="space-y-3">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fases">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3"
                  >
                    {fases.map((fase, index) => (
                      <SecuenciaFaseRow
                        key={`${fase.fase_catalogo_id}-${index}`}
                        fase={fase}
                        index={index}
                        onActualizar={handleActualizarFase}
                        onEliminar={handleEliminarFase}
                        errors={errors.fases?.[index]}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {errors.fases && (
              <p className="text-error text-caption">{errors.fases.message}</p>
            )}

            <SelectorFases
              fasesDisponibles={fasesCatalogo}
              onAgregar={handleAgregarFase}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precio y observaciones</CardTitle>
          </CardHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Precio total ($)"
              id="precio_final"
              type="number"
              min="0"
              step="0.01"
              {...register("precio_final", { valueAsNumber: true })}
              error={errors.precio_final?.message}
            />

            <div className="flex flex-col">
              <label
                htmlFor="observaciones"
                className="text-metadata text-text-muted"
              >
                Observaciones
              </label>
              <textarea
                id="observaciones"
                {...register("observaciones")}
                rows={3}
                className="input resize-none"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/cotizaciones")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!esEdicion && !solicitudSeleccionada}
          >
            <Save className="h-4 w-4" />
            {esEdicion ? "Guardar cambios" : "Crear cotizacion"}
          </Button>
        </div>
        {errors.root && (
          <p
            role="alert"
            className="rounded-lg bg-error-light p-3 text-label text-error"
          >
            {errors.root.message}
          </p>
        )}
      </form>
    </div>
  );
};
