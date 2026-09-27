import { useMemo } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { mocks } from "../../mocks";
import { useCotizaciones } from "../../hooks/useCotizaciones";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import { Button, Card, CardTitle, Field, Title } from "../../components/ui";
import { SelectorFases } from "../../components/SelectorFases";
import { SecuenciaFaseRow } from "../../components/SecuenciaFaseRow";
import {
  cotizacionSchema,
  cotizacionDefaults,
} from "../../utils/cotizacionSchema";
import { IMPORTE_EJEMPLO } from "../../utils/importe";
import { useWatch } from "react-hook-form";

// Banner informativo con los datos de la solicitud (sin edición).
const DetalleSolicitud = ({ solicitud }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <div>
      <p className="text-metadata text-text-muted">Solicitud</p>
      <p className="text-body font-medium text-ink">
        {solicitud.numero_solicitud}
      </p>
    </div>
    <div>
      <p className="text-metadata text-text-muted">Cliente</p>
      <p className="text-body font-medium text-ink">
        {solicitud.cliente_razon_social}
      </p>
    </div>
    <div>
      <p className="text-metadata text-text-muted">Pieza</p>
      <p className="text-body font-medium text-ink">
        {solicitud.descripcion_pieza}
      </p>
    </div>
    <div>
      <p className="text-metadata text-text-muted">Cantidad</p>
      <p className="text-body font-medium text-ink">
        {solicitud.cantidad} unidades
      </p>
    </div>
    <div>
      <p className="text-metadata text-text-muted">Fecha esperada</p>
      <p className="text-body font-medium text-ink">
        {solicitud.fecha_esperada_entrega}
      </p>
    </div>
    {solicitud.notas_comerciales && (
      <div className="sm:col-span-2">
        <p className="text-metadata text-text-muted">Notas comerciales</p>
        <p className="text-body text-text-secondary">
          {solicitud.notas_comerciales}
        </p>
      </div>
    )}
  </div>
);

export const CotizacionFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cotizaciones, agregarCotizacion } = useCotizaciones();
  const { obtenerSolicitud, cargando: cargandoSolicitudes } = useSolicitudes();

  // FE-154: la solicitud llega por query (?solicitud=<id>) desde el botón
  // "Cotizar" del listado. Sin desplegable: entrar sin id redirige.
  const solicitudIdParam = Number(searchParams.get("solicitud")) || null;

  const solicitudSeleccionada = solicitudIdParam;
  const solicitudActual = solicitudSeleccionada
    ? obtenerSolicitud(solicitudSeleccionada)
    : null;

  // Una solicitud deja de estar disponible si ya tiene cotización o su
  // estado ya no es pendiente (solo se evalúa con datos cargados).
  const yaCotizada =
    !cargandoSolicitudes &&
    solicitudSeleccionada != null &&
    (solicitudActual == null ||
      solicitudActual.estado !== "PENDIENTE_COTIZACION" ||
      cotizaciones.some((c) => c.solicitud_id === solicitudSeleccionada));

  const fasesCatalogo = useMemo(() => mocks.fases.filter((f) => f.activo), []);

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
    defaultValues: cotizacionDefaults,
  });

  const fases = useWatch({ control, name: "fases" }) ?? [];

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
      navigate("/cotizaciones");
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.message || "No se pudo guardar la cotización.",
      });
    }
  };

  // Sin ?solicitud= no hay nada que cotizar: volver al listado.
  if (solicitudIdParam == null) {
    return <Navigate to="/solicitudes" replace />;
  }

  // Solicitud ya cotizada: vista informativa sin formulario. No se pueden
  // definir fases ni precio; solo datos de la solicitud, leyenda y volver.
  if (!cargandoSolicitudes && yaCotizada) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Title>Nueva cotización</Title>
        <div>
          <button
            type="button"
            onClick={() => navigate("/solicitudes")}
            className="inline-flex items-center gap-1 text-label font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Solicitudes
          </button>
          <div>
            <h1 className="mt-2 text-h1 text-ink">Nueva cotización</h1>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <CardTitle className="text-label font-medium">
              Solicitud asociada
            </CardTitle>
          </div>
          <div className="p-4">
            {solicitudActual ? (
              <>
                <DetalleSolicitud solicitud={solicitudActual} />
                <p role="alert" className="mt-4 text-body text-error">
                  Esta solicitud ya no está pendiente de cotizar.
                </p>
              </>
            ) : (
              <p role="alert" className="text-body text-error">
                No se encontró la solicitud solicitada.
              </p>
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => navigate("/solicitudes")}>
            Volver a solicitudes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Title>Nueva cotización</Title>
      <div>
        <button
          type="button"
          onClick={() => navigate("/solicitudes")}
          className="inline-flex items-center gap-1 text-label font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Solicitudes
        </button>
        <div>
          <h1 className="mt-2 text-h1 text-ink">Nueva cotización</h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_224px] lg:items-start"
      >
        <div className="space-y-5">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <CardTitle className="text-label font-medium">
                Solicitud asociada
              </CardTitle>
            </div>
            <div className="p-4">
              {cargandoSolicitudes ? (
                <p className="text-body text-text-secondary">
                  Cargando solicitud...
                </p>
              ) : solicitudActual ? (
                <DetalleSolicitud solicitud={solicitudActual} />
              ) : (
                <p role="alert" className="text-body text-error">
                  No se encontró la solicitud solicitada.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-b border-border px-4 py-3">
              <CardTitle className="text-label font-medium">
                Secuencia de fases
              </CardTitle>
            </div>
            <div className="p-4">
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
                  <p className="text-error text-caption">
                    {errors.fases.message}
                  </p>
                )}

                <SelectorFases
                  fasesDisponibles={fasesCatalogo}
                  onAgregar={handleAgregarFase}
                />
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <CardTitle className="text-label font-medium">
                Precio y observaciones
              </CardTitle>
            </div>
            <div className="p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Precio total ($)"
                  id="precio_final"
                  // Texto y no number a proposito: `type="number"` descarta los
                  // separadores de miles y parseaba "10.000" como 10
                  // El texto entra crudo al schema, que lo normaliza con
                  // `parseImporte`; al backend sigue yendo un numero.
                  type="text"
                  inputMode="decimal"
                  placeholder="24.500,50"
                  helperText={`Podés escribir ${IMPORTE_EJEMPLO}. El último separador es decimal si tiene 1 o 2 dígitos.`}
                  {...register("precio_final")}
                  onFocus={(event) => event.currentTarget.select()}
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
            </div>
          </Card>
        </div>

        <div className="order-first rounded-xl border border-border bg-surface p-3 shadow-card lg:order-none lg:sticky lg:top-6">
          {errors.root && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-error-light p-3 text-label text-error"
            >
              {errors.root.message}
            </p>
          )}
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={
              solicitudSeleccionada == null ||
              cargandoSolicitudes ||
              yaCotizada ||
              solicitudActual == null
            }
            className="w-full"
          >
            <Save className="h-4 w-4" />
            Crear cotización
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/solicitudes")}
            className="mt-2 w-full"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
