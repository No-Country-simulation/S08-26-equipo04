import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import { Button, Card, CardHeader, CardTitle, Badge } from '../../components/ui';

const estadoBadge = {
  LISTA_PARA_ENVIAR: 'pending',
  ENVIADA_A_CLIENTE: 'quoted',
  APROBADA: 'approved',
  NO_APROBADA: 'production',
};

const estadoLabel = {
  LISTA_PARA_ENVIAR: 'Lista para enviar',
  ENVIADA_A_CLIENTE: 'Enviada a cliente',
  APROBADA: 'Aprobada',
  NO_APROBADA: 'No aprobada',
};

export const CotizacionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cotizaciones } = useCotizaciones();

  const cotizacion = useMemo(
    () => cotizaciones.find((c) => c.id === Number(id)),
    [cotizaciones, id]
  );

  if (!cotizacion) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="ghost" onClick={() => navigate('/cotizaciones')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Card>
          <p className="py-8 text-center text-body text-text-muted">
            No se encontro la cotizacion solicitada.
          </p>
        </Card>
      </div>
    );
  }

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
          <h1 className="mt-1 text-h1 text-ink">Detalle de cotizacion</h1>
          <p className="mt-1 text-body text-text-secondary">
            {cotizacion.numero_cotizacion} — {cotizacion.cliente_razon_social}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacion general</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-metadata text-text-muted">Solicitud</p>
            <p className="text-body font-medium text-ink">
              {cotizacion.solicitud_numero}
            </p>
          </div>
          <div>
            <p className="text-metadata text-text-muted">Cliente</p>
            <p className="text-body font-medium text-ink">
              {cotizacion.cliente_razon_social}
            </p>
          </div>
          <div>
            <p className="text-metadata text-text-muted">Estado</p>
            <Badge variant={estadoBadge[cotizacion.estado] || 'pending'} type="inline">
              {estadoLabel[cotizacion.estado] || cotizacion.estado}
            </Badge>
          </div>
          <div>
            <p className="text-metadata text-text-muted">Precio final</p>
            <p className="text-body font-medium text-ink">
              ${cotizacion.precio_final.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secuencia de fases</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {cotizacion.fases.map((fase, index) => (
            <div
              key={`${fase.fase_catalogo_id}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-canvas p-4"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-tint text-caption font-semibold text-primary">
                {fase.numero_secuencia || index + 1}
              </span>
              <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <span className="font-medium text-ink">{fase.fase_nombre}</span>
                <span className="text-metadata text-text-muted">
                  {fase.tiempo_estimado_minutos} min
                </span>
              </div>
              {fase.instrucciones_fase && (
                <p className="text-metadata text-text-secondary max-w-md truncate">
                  {fase.instrucciones_fase}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {cotizacion.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <p className="text-body text-text-secondary">{cotizacion.observaciones}</p>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate('/cotizaciones')}
        >
          Volver
        </Button>
        {cotizacion.estado === 'LISTA_PARA_ENVIAR' && (
          <Button
            onClick={() => navigate(`/cotizaciones/${cotizacion.id}/editar`)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>
    </div>
  );
};
