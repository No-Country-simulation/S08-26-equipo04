import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
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
export const TaskCardMobile = ({
  tarea,
  accionEnCurso = false,
  salida = false,
  onIniciar,
  onFinalizar,
  onSalidaCompleta,
  onVerDetalle,
}) => {
  const estado = estadoConfig[tarea.estado] || { variant: 'queue', label: tarea.estado };
  const puedeIniciar = tarea.estado === 'EN_COLA';
  const puedeFinalizar = tarea.estado === 'EN_EJECUCION';
  const cardRef = useRef(null);
  const badgeRef = useRef(null);
  const pressMediaRef = useRef(null);
  const estadoAnteriorRef = useRef(tarea.estado);

  useEffect(() => () => pressMediaRef.current?.revert(), []);

  useEffect(() => {
    const cambioEstado = estadoAnteriorRef.current !== tarea.estado;
    estadoAnteriorRef.current = tarea.estado;
    if (!cambioEstado) return undefined;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: reduce)', () => {
      if (!salida) return undefined;
      const frame = window.requestAnimationFrame(() =>
        onSalidaCompleta?.(tarea.id),
      );
      return () => window.cancelAnimationFrame(frame);
    });
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        onComplete: () => {
          if (salida) onSalidaCompleta?.(tarea.id);
        },
      });
      timeline.fromTo(
        badgeRef.current,
        { scale: 0.92 },
        { scale: 1, duration: 0.16, ease: 'power1.out' },
      );
      if (salida) {
        timeline.to(cardRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in',
          overflow: 'hidden',
        });
      }
      return () => timeline.kill();
    });

    return () => media.revert();
  }, [tarea.estado, tarea.id, salida, onSalidaCompleta]);

  const animarPulsacion = (event) => {
    pressMediaRef.current?.revert();
    const button = event.currentTarget;
    const media = gsap.matchMedia();
    pressMediaRef.current = media;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.fromTo(
        button,
        { scale: 1 },
        {
          scale: 1.04,
          duration: 0.08,
          repeat: 1,
          yoyo: true,
          ease: 'power1.out',
          clearProps: 'transform',
          onComplete: () => media.revert(),
        },
      );
      return () => tween.kill();
    });
  };

  return (
    <Card
      ref={cardRef}
      className={`w-full p-4 sm:p-5 ${salida ? 'overflow-hidden' : ''}`}
      data-testid={`task-card-${tarea.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-primary">{tarea.ot_numero ?? "—"}</p>
          <h3 className="truncate text-h2 text-ink">{tarea.fase_nombre ?? "Fase sin nombre"}</h3>
        </div>
        <span ref={badgeRef} className="inline-flex">
          <Badge variant={estado.variant}>{estado.label}</Badge>
        </span>
      </div>

      {/* Cada dato con su etiqueta: sin esto "Tope de caja 10 mm" al lado de un
          codigo de OT no deja claro cual es la pieza y cual la fase. */}
      {(tarea.descripcion_pieza || tarea.cantidad != null) && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-label">
          {tarea.descripcion_pieza && (
            <>
              <dt className="text-text-muted">Pieza</dt>
              <dd className="min-w-0 break-words text-ink">{tarea.descripcion_pieza}</dd>
            </>
          )}
          {tarea.cantidad != null && (
            <>
              <dt className="text-text-muted">Cantidad</dt>
              <dd className="text-ink">{tarea.cantidad} uds</dd>
            </>
          )}
        </dl>
      )}

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
          aria-label={`Ver detalle de ${tarea.fase_nombre ?? "la fase"} de ${tarea.ot_numero ?? "la OT"}`}
        >
          <Eye className="h-5 w-5" aria-hidden="true" />
          Ver detalle
        </Button>
        {puedeIniciar && (
          <Button
            size="lg"
            onClick={(event) => {
              animarPulsacion(event);
              onIniciar?.(tarea);
            }}
            loading={accionEnCurso}
            className="min-h-[56px] w-full text-base font-semibold"
            aria-label={`Iniciar ${tarea.fase_nombre ?? "la fase"} de ${tarea.ot_numero ?? "la OT"}`}
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            Iniciar
          </Button>
        )}
        {puedeFinalizar && (
          <Button
            size="lg"
            variant="secondary"
            onClick={(event) => {
              animarPulsacion(event);
              onFinalizar?.(tarea);
            }}
            loading={accionEnCurso}
            className="min-h-[56px] w-full text-base font-semibold"
            aria-label={`Terminar ${tarea.fase_nombre ?? "la fase"} de ${tarea.ot_numero ?? "la OT"}`}
          >
            <CheckCheck className="h-5 w-5" aria-hidden="true" />
            Terminar
          </Button>
        )}
      </div>
    </Card>
  );
};
