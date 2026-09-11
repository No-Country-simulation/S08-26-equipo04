import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { mocks } from '../../mocks';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import { Button, Card, CardHeader, CardTitle, Field } from '../../components/ui';
import { SelectorFases } from '../../components/SelectorFases';
import { SecuenciaFaseRow } from '../../components/SecuenciaFaseRow';
import { cotizacionSchema, cotizacionDefaults } from '../../utils/cotizacionSchema';

export const CotizacionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);
  const { cotizaciones, agregarCotizacion, actualizarCotizacion } = useCotizaciones();

  const cotizacionExistente = esEdicion
    ? cotizaciones.find((c) => c.id === Number(id))
    : null;

  const solicitudesDisponibles = useMemo(
    () => mocks.solicitudes.filter(
      (s) => (s.estado === 'PENDIENTE_COTIZACION' || s.estado === 'COTIZADA') && !cotizaciones.some((c) => c.solicitud_id === s.id)
    ),
    [cotizaciones]
  );

  const fasesCatalogo = useMemo(
    () => mocks.fases.filter((f) => f.activo),
    []
  );

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(
    cotizacionExistente?.solicitud_id || null
  );

  const solicitudActual = solicitudSeleccionada
    ? mocks.solicitudes.find((s) => s.id === solicitudSeleccionada)
    : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
          observaciones: cotizacionExistente.observaciones || '',
        }
      : cotizacionDefaults,
  });

  const fases = watch('fases');

  const handleSeleccionarSolicitud = (e) => {
    const solicitudId = Number(e.target.value) || null;
    setSolicitudSeleccionada(solicitudId);
  };

  const handleAgregarFase = (nuevaFase) => {
    setValue('fases', [...fases, nuevaFase], { shouldValidate: true });
  };

  const handleActualizarFase = (index, faseActualizada) => {
    const nuevasFases = [...fases];
    nuevasFases[index] = faseActualizada;
    setValue('fases', nuevasFases, { shouldValidate: true });
  };

  const handleEliminarFase = (index) => {
    const nuevasFases = fases.filter((_, i) => i !== index);
    setValue('fases', nuevasFases, { shouldValidate: true });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const nuevasFases = [...fases];
    const [movida] = nuevasFases.splice(result.source.index, 1);
    nuevasFases.splice(result.destination.index, 0, movida);
    setValue('fases', nuevasFases, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    setTimeout(() => {
      if (esEdicion) {
        actualizarCotizacion(Number(id), data);
        toast.success('Cotizacion actualizada correctamente');
      } else {
        const solicitud = mocks.solicitudes.find((s) => s.id === solicitudSeleccionada);
        agregarCotizacion({
          numero_cotizacion: `COT-2026-${String(cotizaciones.length + 1).padStart(4, '0')}`,
          solicitud_id: solicitudSeleccionada,
          solicitud_numero: solicitud?.numero_solicitud || '',
          cliente_razon_social: solicitud?.cliente_razon_social || '',
          jefe_produccion_id: 2,
          jefe_produccion_nombre: 'Martin Jefe',
          precio_final: data.precio_final,
          estado: 'LISTA_PARA_ENVIAR',
          fecha_envio_cliente: null,
          fecha_respuesta_cliente: null,
          motivo_rechazo_cliente: null,
          observaciones: data.observaciones,
          fases: data.fases.map((f, i) => ({
            id: i + 1,
            ...f,
            numero_secuencia: i + 1,
          })),
        });
        toast.success('Cotizacion creada correctamente');
      }
      navigate('/cotizaciones');
    }, 400);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/cotizaciones')}
          className="mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-label text-primary">Cotizaciones</p>
          <h1 className="mt-1 text-h1 text-ink">
            {esEdicion ? 'Editar cotizacion' : 'Nueva cotizacion'}
          </h1>
          {cotizacionExistente && (
            <p className="mt-1 text-body text-text-secondary">
              {cotizacionExistente.numero_cotizacion} —{' '}
              {cotizacionExistente.cliente_razon_social}
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
              <label className="text-metadata text-text-muted">
                Seleccionar solicitud
              </label>
              <select
                value={solicitudSeleccionada || ''}
                onChange={handleSeleccionarSolicitud}
                className="input"
              >
                <option value="">Seleccionar una solicitud...</option>
                {solicitudesDisponibles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.numero_solicitud} — {s.cliente_razon_social} ({s.descripcion_pieza})
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
                  <p className="text-metadata text-text-muted">Fecha esperada</p>
                  <p className="text-body font-medium text-ink">
                    {solicitudActual.fecha_esperada_entrega}
                  </p>
                </div>
                {solicitudActual.notas_comerciales && (
                  <div className="sm:col-span-2">
                    <p className="text-metadata text-text-muted">Notas comerciales</p>
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
                  {cotizacionExistente.solicitud_numero}
                </p>
              </div>
              <div>
                <p className="text-metadata text-text-muted">Cliente</p>
                <p className="text-body font-medium text-ink">
                  {cotizacionExistente.cliente_razon_social}
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
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
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
              {...register('precio_final', { valueAsNumber: true })}
              error={errors.precio_final?.message}
            />

            <div className="flex flex-col">
              <label className="text-metadata text-text-muted">
                Observaciones
              </label>
              <textarea
                {...register('observaciones')}
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
            onClick={() => navigate('/cotizaciones')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!esEdicion && !solicitudSeleccionada}
          >
            <Save className="h-4 w-4" />
            {esEdicion ? 'Guardar cambios' : 'Crear cotizacion'}
          </Button>
        </div>
      </form>
    </div>
  );
};
