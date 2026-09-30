import { useMemo, useRef, useState } from 'react';
import { Eye, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formatDateTime, formatFechaEntrega, verAdjunto } from '../../api';
import { TIPOS_ARCHIVO, formatBytes, mensajeErrorAdjunto } from '../../utils/adjuntos';
import { Badge, EmptyState, ErrorBanner, SkeletonCard } from '../../components/ui';
import { useGsapAnimation } from '../../hooks/useGsapAnimation';
import { useExpediente } from '../../hooks/useExpediente';

const tabs = ['Resumen', 'Documentos', 'Hoja de ruta', 'Calidad', 'Entrega', 'Historial'];

const estadoLabels = {
  EN_PRODUCCION: 'En producción',
  EN_CALIDAD: 'En calidad',
  NO_CONFORME: 'No conforme',
  DESPACHO: 'Lista para entregar',
  ENTREGADA: 'Entregada',
};

const resultadoCalidadLabels = {
  CONFORME: 'Conforme',
  NO_CONFORME: 'No conforme',
};

const estadoFaseVariant = {
  PENDIENTE: 'queue',
  EN_COLA: 'queue',
  EN_EJECUCION: 'production',
  TERMINADO: 'completed',
};

const estadoFaseLabels = {
  PENDIENTE: 'Pendiente',
  EN_COLA: 'En cola',
  EN_EJECUCION: 'En ejecución',
  TERMINADO: 'Terminada',
};

const leer = (item, snake, camel) => item?.[snake] ?? item?.[camel] ?? null;

const tipoArchivoLabel = (value) =>
  TIPOS_ARCHIVO.find((item) => item.value === value)?.label || value || '—';

export const ExpedientePage = () => {
  const { id } = useParams();
  const {
    expediente,
    orden,
    cotizacion,
    documentos,
    auditoria,
    cargando,
    error,
    noEncontrada,
    recargar,
  } = useExpediente(id);
  const [activeTab, setActiveTab] = useState('Resumen');
  const [abriendoId, setAbriendoId] = useState(null);
  const [errorDocumento, setErrorDocumento] = useState(null);
  const contentRef = useRef(null);
  const timelineRef = useRef(null);

  useGsapAnimation(
    contentRef,
    (gsapInstance, scope) => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (media.matches) {
        gsapInstance.set(scope, { autoAlpha: 1, y: 0 });
        return;
      }
      gsapInstance.fromTo(
        scope,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'opacity,visibility,transform' },
      );
    },
    activeTab,
  );

  useGsapAnimation(
    timelineRef,
    (gsapInstance, scope) => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (media.matches) {
        gsapInstance.set(scope.children, { autoAlpha: 1, y: 0 });
        return;
      }
      gsapInstance.from(scope.children, {
        autoAlpha: 0,
        y: 10,
        stagger: 0.04,
        duration: 0.18,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform',
      });
    },
    activeTab,
  );

  const numeroOt = expediente?.numero_ot ?? orden?.numero_ot ?? orden?.numeroOT ?? id;
  const estado = orden?.estado ?? expediente?.estado ?? null;
  const cliente =
    expediente?.cliente_nombre ??
    cotizacion?.cliente_razon_social ??
    cotizacion?.clienteRazonSocial ??
    orden?.cliente_razon_social ??
    null;
  const trabajo =
    cotizacion?.descripcion_pieza ??
    cotizacion?.descripcionPieza ??
    orden?.descripcion_pieza ??
    null;
  const cantidad = cotizacion?.cantidad ?? orden?.cantidad ?? null;
  const fechaSolicitada =
    cotizacion?.fecha_esperada_entrega ??
    cotizacion?.fechaEsperadaEntrega ??
    orden?.fecha_esperada_entrega ??
    null;
  const monto =
    expediente?.monto_total ?? expediente?.montoTotal ?? cotizacion?.precio_final ?? cotizacion?.precioFinal ?? null;
  const receptor =
    orden?.receptor_nombre ?? orden?.receptorNombre ?? expediente?.receptor_nombre ?? expediente?.receptorNombre ?? null;
  const fechaEntrega =
    orden?.fecha_entrega ??
    orden?.fechaEntrega ??
    orden?.fecha_termino_real ??
    orden?.fechaTerminoReal ??
    expediente?.fecha_entrega ??
    expediente?.fechaEntrega ??
    null;

  // Historial real de fases (PR #234): una fila por fase con estado,
  // operario, fechas, intento y motivo de reasignación. Si todavía viene
  // vacío se muestra lo planificado de la cotización.
  const historialFases = useMemo(
    () => expediente?.historial_fases ?? expediente?.historialFases ?? [],
    [expediente],
  );

  const fasesPlan = useMemo(() => {
    const lista = cotizacion?.fases ?? [];
    return [...lista].sort(
      (a, b) => (leer(a, 'numero_secuencia', 'numeroSecuencia') ?? 0) - (leer(b, 'numero_secuencia', 'numeroSecuencia') ?? 0),
    );
  }, [cotizacion]);

  // Avance real: por cada secuencia se toma el intento más alto y se
  // cuenta cuántos están terminados.
  const avance = useMemo(() => {
    if (historialFases.length === 0) return null;
    const porSecuencia = new Map();
    historialFases.forEach((fase) => {
      const secuencia = leer(fase, 'numero_secuencia', 'numeroSecuencia');
      const intento = leer(fase, 'numero_intento', 'numeroIntento') ?? 1;
      const actual = porSecuencia.get(secuencia);
      if (!actual || intento > (leer(actual, 'numero_intento', 'numeroIntento') ?? 1)) {
        porSecuencia.set(secuencia, fase);
      }
    });
    const ultimas = [...porSecuencia.values()];
    return {
      total: ultimas.length,
      terminadas: ultimas.filter(
        (fase) => leer(fase, 'estado_fase', 'estadoFase') === 'TERMINADO',
      ).length,
    };
  }, [historialFases]);

  const historial = useMemo(() => {
    const eventos = [];
    const agregar = (fecha, texto) => {
      if (fecha) eventos.push({ fecha, texto });
    };
    const fechaCreacion = orden?.fecha_creacion ?? orden?.fechaCreacion ?? expediente?.fecha_creacion ?? null;
    agregar(fechaCreacion, 'Orden de trabajo generada');
    agregar(
      orden?.fecha_inicio_produccion ?? orden?.fechaInicioProduccion ?? null,
      'Inició la producción',
    );
    agregar(
      orden?.fecha_pase_calidad ?? orden?.fechaPaseCalidad ?? expediente?.fecha_pase_calidad ?? null,
      'Ingresó a control de calidad',
    );
    const resultadoAuditoria = auditoria?.resultado ?? auditoria?.resultado_calidad ?? null;
    if (auditoria?.fecha_veredicto ?? auditoria?.fechaVeredicto) {
      agregar(
        auditoria.fecha_veredicto ?? auditoria.fechaVeredicto,
        resultadoAuditoria === 'CONFORME'
          ? 'Calidad: conforme'
          : resultadoAuditoria === 'NO_CONFORME'
            ? 'Calidad: no conforme'
            : 'Calidad: veredicto registrado',
      );
    }
    agregar(
      orden?.fecha_pase_despacho ?? orden?.fechaPaseDespacho ?? null,
      'Aprobada por Calidad, lista para entregar',
    );
    if (fechaEntrega) {
      agregar(fechaEntrega, receptor ? `Entregada a ${receptor}` : 'Entregada');
    }
    // Eventos por fase desde el historial real (inicio, fin y reasignaciones).
    (expediente?.historial_fases ?? expediente?.historialFases ?? []).forEach((fase) => {
      const nombre = leer(fase, 'nombre_fase', 'nombreFase') || 'Fase';
      const operario = leer(fase, 'operario_asignado', 'operarioAsignado');
      const intento = leer(fase, 'numero_intento', 'numeroIntento') ?? 1;
      const etiqueta = intento > 1 ? `${nombre} (intento ${intento})` : nombre;
      const fechaInicio = leer(fase, 'fecha_inicio', 'fechaInicio');
      const fechaFin = leer(fase, 'fecha_fin', 'fechaFin');
      const fechaReasignacion = leer(fase, 'fecha_reasignacion', 'fechaReasignacion');
      const motivo = leer(fase, 'motivo_reasignacion', 'motivoReasignacion');
      if (fechaInicio) agregar(fechaInicio, `${etiqueta} iniciada${operario ? ` por ${operario}` : ''}`);
      if (fechaFin) agregar(fechaFin, `${etiqueta} terminada`);
      if (fechaReasignacion) {
        agregar(fechaReasignacion, `${etiqueta} reasignada${motivo ? `: ${motivo}` : ''}`);
      }
    });
    return eventos
      .map((evento) => ({ ...evento, tiempo: Date.parse(evento.fecha) || 0 }))
      .sort((a, b) => b.tiempo - a.tiempo);
  }, [orden, expediente, auditoria, fechaEntrega, receptor]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-[1360px]">
        <div className="h-4 w-48 animate-pulse rounded bg-border" />
        <div className="mt-3 flex items-center gap-3">
          <div className="h-8 w-56 animate-pulse rounded bg-border" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-border" />
        </div>
        <div className="mt-6 grid overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="border-b border-border px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <div className="h-3 w-20 animate-pulse rounded bg-border" />
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-canvas" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <SkeletonCard rows={5} />
        </div>
      </div>
    );
  }

  if (noEncontrada) {
    return (
      <div className="mx-auto max-w-[1360px]">
        <Link to="/ordenes-trabajo" className="text-metadata text-primary hover:underline">← Volver a Órdenes de trabajo</Link>
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="Orden no encontrada"
            description="No existe un expediente para el identificador solicitado."
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1360px]">
        <Link to="/ordenes-trabajo" className="text-metadata text-primary hover:underline">← Volver a Órdenes de trabajo</Link>
        <div className="mt-4">
          <ErrorBanner message={error} onRetry={recargar} />
        </div>
      </div>
    );
  }

  const verDocumento = async (adjunto) => {
    setAbriendoId(adjunto.id);
    setErrorDocumento(null);
    try {
      const blob = await verAdjunto(adjunto.id);
      const url = URL.createObjectURL(blob);
      const ventana = window.open(url, '_blank');
      if (ventana) {
        ventana.opener = null;
      } else {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.target = '_blank';
        enlace.rel = 'noopener noreferrer';
        enlace.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setErrorDocumento(await mensajeErrorAdjunto(err, 'No se pudo abrir el documento.'));
    } finally {
      setAbriendoId(null);
    }
  };

  const renderContent = () => {
    if (activeTab === 'Documentos') {
      if (documentos.error) {
        return <ErrorBanner message={documentos.error} onRetry={recargar} />;
      }
      if (documentos.lista.length === 0) {
        return (
          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-4 py-3 text-h2">Documentos vinculados</div>
            <div className="p-4">
              <EmptyState
                icon={FileText}
                title="Sin documentos"
                description="Esta solicitud todavía no tiene adjuntos."
              />
            </div>
          </section>
        );
      }
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3 text-h2">Documentos vinculados</div>
          <div className="space-y-2 p-4">
            {documentos.lista.map((documento) => (
              <div key={documento.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1"><p className="truncate text-label font-semibold text-ink">{documento.nombre_original || '—'}</p><p className="truncate text-metadata text-text-muted">{tipoArchivoLabel(documento.tipo_archivo)}{documento.mime_type ? ` · ${documento.mime_type}` : ''}{documento.tamanio_bytes != null ? ` · ${formatBytes(documento.tamanio_bytes)}` : ''}</p></div>
                <button
                  type="button"
                  className="p-1 text-text-secondary disabled:opacity-50"
                  aria-label={`Ver ${documento.nombre_original}`}
                  disabled={abriendoId === documento.id}
                  onClick={() => verDocumento(documento)}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {errorDocumento && <p role="alert" className="px-4 pb-4 text-metadata text-error">{errorDocumento}</p>}
        </section>
      );
    }

    if (activeTab === 'Hoja de ruta') {
      // Con historial real se muestra el estado vivo de cada fase
      // (DoD #213: fase, estado, fechas, operario, intento y motivo).
      // Sin historial, fallback a lo planificado de la cotización.
      if (historialFases.length > 0) {
        // Agrupado por intento: cada pasada completa del trabajo va en su
        // bloque (Intento 1, Intento 2, ...) en vez de mezclarse 1 1 2 2.
        const porIntento = new Map();
        historialFases.forEach((fase) => {
          const intento = leer(fase, 'numero_intento', 'numeroIntento') ?? 1;
          if (!porIntento.has(intento)) porIntento.set(intento, []);
          porIntento.get(intento).push(fase);
        });
        const intentos = [...porIntento.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([intento, lista]) => ({
            intento,
            fases: [...lista].sort(
              (a, b) => (leer(a, 'numero_secuencia', 'numeroSecuencia') ?? 0) - (leer(b, 'numero_secuencia', 'numeroSecuencia') ?? 0),
            ),
          }));
        const filaFase = (fase) => {
          const numero = leer(fase, 'numero_secuencia', 'numeroSecuencia') ?? '—';
          const nombre = leer(fase, 'nombre_fase', 'nombreFase') || '—';
          const estadoFase = leer(fase, 'estado_fase', 'estadoFase');
          const operario = leer(fase, 'operario_asignado', 'operarioAsignado') || '—';
          const intento = leer(fase, 'numero_intento', 'numeroIntento') ?? 1;
          const motivo = leer(fase, 'motivo_reasignacion', 'motivoReasignacion');
          const fechaFin = leer(fase, 'fecha_fin', 'fechaFin');
          const fechaInicio = leer(fase, 'fecha_inicio', 'fechaInicio');
          return (
            <div key={fase.fase_id ?? fase.faseId ?? `${numero}-${intento}`} className="grid min-h-[68px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border px-4 py-3 sm:grid-cols-[40px_minmax(0,1fr)_140px_120px] sm:gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-tint text-metadata font-semibold text-primary">{String(numero).padStart(2, '0')}</span>
              <div className="min-w-0"><p className="text-label font-semibold text-ink">{nombre}</p><p className="text-metadata text-text-muted">{operario}{motivo ? ` · ${motivo}` : ''}</p></div>
              <span className="text-metadata text-text-secondary"><Badge variant={estadoFaseVariant[estadoFase] || 'queue'} type="inline">{estadoFaseLabels[estadoFase] || estadoFase || '—'}</Badge></span>
              <span className="text-left text-metadata text-text-muted sm:text-right">{fechaFin ? formatDateTime(fechaFin) : fechaInicio ? `Inició ${formatDateTime(fechaInicio)}` : '—'}</span>
            </div>
          );
        };
        return (
          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-4 text-h2">Hoja de ruta</div>
            <div className="space-y-5 p-5">
              {intentos.map(({ intento, fases }) => (
                <div key={intento} className="space-y-3">
                  {intentos.length > 1 && (
                    <p className="text-label font-semibold text-text-secondary">Intento {intento}</p>
                  )}
                  {fases.map(filaFase)}
                </div>
              ))}
            </div>
          </section>
        );
      }
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4 text-h2">Hoja de ruta</div>
          <div className="space-y-3 p-5">
            <div className="rounded-lg bg-info-light px-3 py-3 text-label text-info">Fases planificadas en la cotización.</div>
            {fasesPlan.length === 0 ? (
              <p className="text-body text-text-secondary">Esta cotización no tiene fases cargadas.</p>
            ) : (
              fasesPlan.map((fase, index) => {
                const numero = leer(fase, 'numero_secuencia', 'numeroSecuencia') ?? index + 1;
                const nombre = fase.fase_nombre ?? leer(fase, 'nombre_fase', 'nombreFase') ?? '—';
                const minutos = fase.tiempo_estimado_minutos ?? fase.tiempoEstimadoMinutos ?? null;
                const instrucciones = fase.instrucciones_fase ?? fase.instruccionesFase ?? null;
                return (
                  <div key={fase.id ?? `${numero}-${index}`} className="grid min-h-[68px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border px-4 py-3 sm:grid-cols-[40px_minmax(0,1fr)_140px_120px] sm:gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-tint text-metadata font-semibold text-primary">{String(numero).padStart(2, '0')}</span>
                    <div className="min-w-0"><p className="text-label font-semibold text-ink">{nombre}</p><p className="text-metadata text-text-muted">{minutos != null ? `${minutos} min estimados` : '—'}{instrucciones ? ` · ${instrucciones}` : ''}</p></div>
                    <span className="text-metadata text-text-secondary"><Badge variant="queue" type="inline">Planificada</Badge></span>
                    <span className="text-left text-metadata text-text-muted sm:text-right">—</span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      );
    }

    if (activeTab === 'Calidad') {
      const resultado = auditoria?.resultado ?? null;
      if (!auditoria) {
        return <section className="overflow-hidden rounded-xl border border-border bg-surface"><div className="border-b border-border px-4 py-3 text-h2">Control de Calidad</div><div className="m-4 rounded-lg bg-info-light px-3 py-3 text-label text-info">Disponible cuando terminen las fases de producción.</div></section>;
      }
      // Mismo esquema que Entrega: título a la izquierda, badge a la
      // derecha y filas etiqueta/valor con división entre entradas. El
      // veredicto (resultado) va primero, no la fecha.
      const filas = [
        ['Veredicto', resultadoCalidadLabels[resultado] || resultado || '—'],
        ['Fecha de veredicto', formatDateTime(auditoria.fecha_veredicto ?? auditoria.fechaVeredicto)],
        ['Auditor', auditoria.auditor_nombre ?? auditoria.auditorNombre ?? '—'],
      ];
      const observaciones = auditoria.observaciones_generales ?? auditoria.observacionesGenerales ?? null;
      if (observaciones) filas.push(['Observaciones', observaciones]);
      const respuestas = [...(auditoria.respuestas ?? [])].sort(
        (a, b) => (a.item_numero ?? a.itemNumero ?? 0) - (b.item_numero ?? b.itemNumero ?? 0),
      );
      respuestas.forEach((item, index) => {
        const numero = item.item_numero ?? item.itemNumero ?? index + 1;
        filas.push([
          item.criterio_nombre ?? item.criterioNombre ?? `Punto ${numero}`,
          item.resultado_item ?? item.resultadoItem ?? '—',
        ]);
      });
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 text-h2"><span>Control de Calidad</span><span className="badge badge-queue">{resultadoCalidadLabels[resultado] || resultado || '—'}</span></div>
          <div className="px-4 py-2">
            {filas.map(([label, value], index) => (
              <div key={`${label}-${index}`} className={`flex justify-between gap-3 py-3 text-label ${index < filas.length - 1 ? 'border-b border-border' : ''}`}><span className="text-text-muted">{label}</span><span className="text-right text-ink">{value}</span></div>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === 'Entrega') {
      const entregada = estado === 'ENTREGADA';
      return <section className="overflow-hidden rounded-xl border border-border bg-surface"><div className="flex items-center justify-between border-b border-border px-4 py-3 text-h2"><span>Entrega</span><span className="badge badge-queue">{entregada ? 'Entregada' : estado === 'DESPACHO' ? 'Lista para entregar' : 'Pendiente'}</span></div><div className="px-4 py-2"><div className="flex border-b border-border py-3 text-label"><span className="w-36 text-text-muted">Fecha de entrega</span><span>{fechaEntrega ? formatDateTime(fechaEntrega) : '—'}</span></div><div className="flex py-3 text-label"><span className="w-36 text-text-muted">Persona que recibe</span><span>{receptor || '—'}</span></div></div></section>;
    }

    if (activeTab === 'Historial') {
      if (historial.length === 0) {
        return (
          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-4 py-3 text-h2">Historial</div>
            <div className="p-4">
              <EmptyState
                icon={FileText}
                title="Sin movimientos"
                description="Todavía no hay eventos registrados para esta orden."
              />
            </div>
          </section>
        );
      }
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3 text-h2">Historial</div>
          <div ref={timelineRef} className="px-4 py-2">
            {historial.map((evento) => (
              <div
                key={`${evento.fecha}-${evento.texto}`}
                className="flex gap-8 border-b border-border py-3 text-label last:border-b-0"
              >
                <span className="w-28 shrink-0 text-text-muted">{formatDateTime(evento.fecha)}</span>
                <span>{evento.texto}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    const montoTexto = monto != null ? `$${Number(monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—';
    // Resultado de Calidad: la última auditoría manda; si aún no hay,
    // se usa el del expediente ("Aprobado" | "Rechazado" | "Pendiente").
    const calidadTexto =
      auditoria?.resultado != null
        ? resultadoCalidadLabels[auditoria.resultado] || auditoria.resultado
        : leer(expediente, 'resultado_calidad', 'resultadoCalidad') || 'Pendiente';
    const avanceTexto = avance != null ? `${avance.terminadas} de ${avance.total}` : fasesPlan.length === 0 ? '—' : String(fasesPlan.length);
    const avanceSubtitulo = avance != null ? 'fases terminadas' : 'fases planificadas';
    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_280px]">
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3 text-h2">Información del trabajo</div>
          <div className="px-4 py-2">{[
            ['Solicitud', cotizacion?.solicitud_numero ?? cotizacion?.solicitudNumero ?? '—'],
            ['Cotización', cotizacion?.numero_cotizacion ?? cotizacion?.numeroCotizacion ?? '—'],
            ['Cliente', cliente || '—'],
            ['Descripción', `${trabajo || '—'}, ${cantidad ?? '—'} unidades`],
            ['Monto total', montoTexto],
            ['Calidad', calidadTexto],
          ].map(([label, value], index, values) => <div key={label} className={`flex justify-between gap-3 py-3 text-label ${index < values.length - 1 ? 'border-b border-border' : ''}`}><span className="text-text-muted">{label}</span><span className="text-right text-ink">{value}</span></div>)}</div>
        </section>
        <aside className="h-fit rounded-xl border border-border bg-surface p-4"><span className="text-label text-text-secondary">Avance</span><div className="mt-3 text-2xl font-semibold text-ink">{avanceTexto}</div><p className="text-metadata text-text-muted">{avanceSubtitulo}</p><div className="mt-3 rounded-lg bg-info-light px-3 py-3 text-metadata text-info">{estadoLabels[estado] || 'En producción'}.</div></aside>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1360px]">
      <Link to="/ordenes-trabajo" className="text-metadata text-primary hover:underline">← Volver a Órdenes de trabajo</Link>
      <div className="mt-3 flex items-center gap-3"><h1 className="text-h1 text-ink">{numeroOt}</h1><span className="badge badge-production">● {estadoLabels[estado] || 'En producción'}</span></div>
      <div className="mt-6 grid overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-4">{[
        ['Cliente', cliente || '—'],
        ['Trabajo', trabajo || '—'],
        ['Cantidad', cantidad != null ? `${cantidad} piezas` : '—'],
        ['Fecha de entrega solicitada', formatFechaEntrega(fechaSolicitada)],
      ].map(([label, value]) => <div key={label} className="border-b border-border px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><p className="text-metadata text-text-muted">{label}</p><p className="mt-1 text-label font-semibold text-ink">{value}</p></div>)}</div>
      <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-border bg-canvas p-1">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-3 py-2 text-metadata ${activeTab === tab ? 'bg-surface text-ink shadow-sm' : 'text-text-secondary hover:bg-surface/70'}`}>{tab}</button>)}</div>
      <div ref={contentRef} className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};
