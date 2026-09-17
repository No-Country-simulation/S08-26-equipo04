import { CheckCheck, Clock3, Eye, Play } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';

const estadoConfig = {
  EN_COLA: { variant: 'queue', label: 'En cola' },
  EN_EJECUCION: { variant: 'production', label: 'En ejecucion' },
  TERMINADO: { variant: 'completed', label: 'Terminada' },
};

/**
 * Tarjeta de tarea mobile-first para el Operario (HU-3.1).
 * Botones tactiles grandes (minimo 56px de alto) pensados para tablet/celular.
 */
export const TaskCardMobile = ({ tarea, accionEnCurso = false, onIniciar, onFinalizar, onVerDetalle }) => {
  const estado = estadoConfig[tarea.estado] || { variant: 'queue', label: tarea.estado };
  const puedeIniciar = tarea.estado === 'EN_COLA';
  const puedeFinalizar = tarea.estado === 'EN_EJECUCION';

  return (
    <Card className="w-full p-4 sm:p-5" data-testid={`task-card-${tarea.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-metadata text-text-muted">{tarea.ot_numero}</p>
          <h3 className="truncate text-h2 text-ink">{tarea.fase_nombre}</h3>
          <p className="mt-0.5 text-label text-text-secondary">
            Fase {tarea.numero_secuencia}
            {tarea.tiempo_estimado_minutos ? ` · ~${tarea.tiempo_estimado_minutos} min` : ''}
          </p>
        </div>
        <Badge variant={estado.variant}>{estado.label}</Badge>
      </div>

      {tarea.fecha_vencimiento && (
        <p className="mt-3 flex items-center gap-1.5 text-label text-text-secondary">
          <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Vence: {new Date(tarea.fecha_vencimiento).toLocaleString('es-AR')}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3">
        <Button
          size="lg"
          variant="ghost"
          onClick={() => onVerDetalle?.(tarea)}
          className="min-h-[56px] w-full text-base font-semibold"
          aria-label={`Ver detalle de ${tarea.fase_nombre} de ${tarea.ot_numero}`}
        >
          <Eye className="h-5 w-5" aria-hidden="true" />
          Ver detalle
        </Button>
        {puedeIniciar && (
          <Button
            size="lg"
            onClick={() => onIniciar?.(tarea)}
            loading={accionEnCurso}
            className="min-h-[56px] w-full text-base font-semibold"
            aria-label={`Iniciar ${tarea.fase_nombre} de ${tarea.ot_numero}`}
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            Iniciar
          </Button>
        )}
        {puedeFinalizar && (
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onFinalizar?.(tarea)}
            loading={accionEnCurso}
            className="min-h-[56px] w-full text-base font-semibold"
            aria-label={`Terminar ${tarea.fase_nombre} de ${tarea.ot_numero}`}
          >
            <CheckCheck className="h-5 w-5" aria-hidden="true" />
            Terminar
          </Button>
        )}
      </div>
    </Card>
  );
};
