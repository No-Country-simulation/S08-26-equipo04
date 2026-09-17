import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Check, Pencil, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import { Button, Card, CardHeader, CardTitle, Badge, Modal, Title } from '../../components/ui';

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
  const { cotizaciones, aprobarCotizacion, rechazarCotizacion } = useCotizaciones();
  const { obtenerSolicitud } = useSolicitudes();
  const { user } = useAuth();
  const [modal, setModal] = useState(null);
  const [motivo, setMotivo] = useState('');

  const cotizacion = useMemo(
    () => cotizaciones.find((c) => c.id === Number(id)),
    [cotizaciones, id]
  );
  const solicitud = useMemo(
    () => (cotizacion ? obtenerSolicitud(cotizacion.solicitud_id) : null),
    [cotizacion, obtenerSolicitud]
  );

  const aprobar = () => {
    const orden = aprobarCotizacion(cotizacion.id);
    setModal(null);
    toast.success(`Cotización aprobada. Se generó ${orden.numero_ot}.`);
  };

  const rechazar = (event) => {
    event.preventDefault();
    if (!motivo.trim()) return;
    rechazarCotizacion(cotizacion.id, motivo.trim());
    setMotivo('');
    setModal(null);
    toast.success('Cotización marcada como no aprobada.');
  };

  if (!cotizacion) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Title>Cotización no encontrada</Title>
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
      <Title>Detalle de cotización</Title>
      <div className="flex flex-wrap items-start justify-between gap-4">
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
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-h1 text-ink">{cotizacion.numero_cotizacion}</h1>
            <Badge variant={estadoBadge[cotizacion.estado] || 'pending'}>{estadoLabel[cotizacion.estado] || cotizacion.estado}</Badge>
          </div>
        </div>
      </div>
        {cotizacion.estado === 'ENVIADA_A_CLIENTE' && user?.rol === 'VENDEDOR' && (
          <Button onClick={() => setModal('aprobar')}>Registrar respuesta</Button>
        )}
      </div>

      <Card className="p-0">
        <div className="grid divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div>
            <p className="p-4 pb-1 text-metadata text-text-muted">Solicitud</p>
            <p className="px-4 pb-4 text-body font-semibold text-ink">{cotizacion.solicitud_numero}</p>
          </div>
          <div>
            <p className="p-4 pb-1 text-metadata text-text-muted">Cliente</p>
            <p className="px-4 pb-4 text-body font-semibold text-ink">{cotizacion.cliente_razon_social}</p>
          </div>
          <div>
            <p className="p-4 pb-1 text-metadata text-text-muted">Cantidad</p>
            <p className="px-4 pb-4 text-body font-semibold text-ink">{solicitud?.cantidad || cotizacion.cantidad || '-'} piezas</p>
          </div>
          <div>
            <p className="p-4 pb-1 text-metadata text-text-muted">Fecha de entrega solicitada</p>
            <p className="px-4 pb-4 text-body font-semibold text-ink">{solicitud?.fecha_esperada_entrega ? new Date(`${solicitud.fecha_esperada_entrega}T12:00:00`).toLocaleDateString('es-AR') : '-'}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_264px]">
      <Card className="p-0">
        <CardHeader className="border-b border-border px-4 py-4 sm:px-6"><CardTitle>Fases cotizadas</CardTitle></CardHeader>
        <div className="space-y-2 p-4 sm:p-6">
          {cotizacion.fases.map((fase, index) => (
            <div key={`${fase.fase_catalogo_id}-${index}`} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-tint text-caption font-semibold text-primary">{String(fase.numero_secuencia || index + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1"><p className="text-label font-semibold text-ink">{fase.fase_nombre}</p><p className="text-metadata text-text-muted">{fase.instrucciones_fase || 'Sin instrucciones'}</p></div>
              <span className="shrink-0 text-metadata text-text-muted">{Math.floor(fase.tiempo_estimado_minutos / 60).toString().padStart(2, '0')} h {String(fase.tiempo_estimado_minutos % 60).padStart(2, '0')} min</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="h-fit"><p className="text-label text-text-secondary">Precio final</p><p className="mt-4 text-2xl font-bold text-ink">${cotizacion.precio_final.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p></Card>
      </div>

      {cotizacion.estado === 'NO_APROBADA' && cotizacion.motivo_rechazo_cliente && (
        <Card>
          <CardHeader>
            <CardTitle>Motivo de rechazo del cliente</CardTitle>
          </CardHeader>
          <p className="text-body text-text-secondary">{cotizacion.motivo_rechazo_cliente}</p>
        </Card>
      )}

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
        {cotizacion.estado === 'LISTA_PARA_ENVIAR' && user?.rol === 'JEFE_PRODUCCION' && (
          <Button
            onClick={() => navigate(`/cotizaciones/${cotizacion.id}/editar`)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <Modal open={modal === 'aprobar'} onClose={() => setModal(null)} title="Registrar respuesta del cliente">
        <p className="text-body text-text-secondary">¿El cliente aprobó la cotización {cotizacion.numero_cotizacion}? Esta acción generará automáticamente una orden de trabajo.</p>
        <div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal('rechazar')}><X className="h-4 w-4" />Rechazar</Button><Button onClick={aprobar}><Check className="h-4 w-4" />Aprobar</Button></div>
      </Modal>
      <Modal open={modal === 'rechazar'} onClose={() => setModal(null)} title="Rechazar cotización">
        <form onSubmit={rechazar} className="space-y-4"><label htmlFor="motivo-rechazo" className="block text-label text-ink">Motivo del rechazo <span className="text-error">*</span></label><textarea id="motivo-rechazo" className="input min-h-28 resize-y" value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Indica por qué el cliente rechazó la cotización" required /><div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="destructive" type="submit">Confirmar rechazo</Button></div></form>
      </Modal>
    </div>
  );
};
