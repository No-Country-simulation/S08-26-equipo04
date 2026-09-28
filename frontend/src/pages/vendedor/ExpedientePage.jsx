import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formatDate, formatDateTime, verAdjunto } from '../../api';
import { TIPOS_ARCHIVO, formatBytes, mensajeErrorAdjunto } from '../../utils/adjuntos';
import { EmptyState, ErrorBanner, SkeletonCard } from '../../components/ui';
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

  const fases = useMemo(() => {
    const lista = cotizacion?.fases ?? [];
    return [...lista].sort(
      (a, b) => (a.numero_secuencia ?? a.numeroSecuencia ?? 0) - (b.numero_secuencia ?? b.numeroSecuencia ?? 0),
    );
  }, [cotizacion]);

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
                <FileText className="h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1"><p className="text-label font-semibold text-ink">{documento.nombre_original || '—'}</p><p className="text-metadata text-text-muted">{tipoArchivoLabel(documento.tipo_archivo)}</p></div>
                <span className="text-metadata text-text-muted">{documento.mime_type || ''}{documento.tamanio_bytes != null ? ` · ${formatBytes(documento.tamanio_bytes)}` : ''}</span>
                <button
                  type="button"
                  className="p-1 text-text-secondary disabled:opacity-50"
                  aria-label={`Abrir ${documento.nombre_original}`}
                  disabled={abriendoId === documento.id}
                  onClick={() => verDocumento(documento)}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {errorDocumento && <p role="alert" className="px-4 pb-4 text-metadata text-error">{errorDocumento}</p>}
        </section>
      );
    }

    if (activeTab === 'Hoja de ruta') {
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4 text-h2">Hoja de ruta</div>
          <div className="space-y-3 p-5">
            <div className="rounded-lg bg-info-light px-3 py-3 text-label text-info">Fases planificadas en la cotización. El seguimiento en tiempo real de cada fase estará disponible próximamente.</div>
            {fases.length === 0 ? (
              <p className="text-body text-text-secondary">Esta cotización no tiene fases cargadas.</p>
            ) : (
              fases.map((fase, index) => {
                const numero = fase.numero_secuencia ?? fase.numeroSecuencia ?? index + 1;
                const nombre = fase.fase_nombre ?? fase.nombre_fase ?? fase.nombreFase ?? '—';
                const minutos = fase.tiempo_estimado_minutos ?? fase.tiempoEstimadoMinutos ?? null;
                const instrucciones = fase.instrucciones_fase ?? fase.instruccionesFase ?? null;
                return (
                  <div key={fase.id ?? `${numero}-${index}`} className="grid min-h-[68px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border px-4 py-3 sm:grid-cols-[40px_minmax(0,1fr)_140px_120px] sm:gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-tint text-metadata font-semibold text-primary">{String(numero).padStart(2, '0')}</span>
                    <div className="min-w-0"><p className="text-label font-semibold text-ink">{nombre}</p><p className="text-metadata text-text-muted">{minutos != null ? `${minutos} min estimados` : '—'}{instrucciones ? ` · ${instrucciones}` : ''}</p></div>
                    <span className="text-metadata text-text-secondary">Planificada</span>
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
      const respuestas = auditoria.respuestas ?? [];
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 text-h2"><span>Control de Calidad</span><span className="badge badge-queue">{resultadoCalidadLabels[resultado] || resultado || '—'}</span></div>
          <div className="px-4 py-2">
            <div className="flex justify-between gap-3 border-b border-border py-3 text-label"><span className="text-text-muted">Veredicto</span><span className="text-right text-ink">{formatDateTime(auditoria.fecha_veredicto ?? auditoria.fechaVeredicto)}</span></div>
            <div className="flex justify-between gap-3 border-b border-border py-3 text-label"><span className="text-text-muted">Auditor</span><span className="text-right text-ink">{auditoria.auditor_nombre ?? auditoria.auditorNombre ?? '—'}</span></div>
            {(auditoria.observaciones_generales ?? auditoria.observacionesGenerales) && (
              <div className="flex justify-between gap-3 border-b border-border py-3 text-label"><span className="text-text-muted">Observaciones</span><span className="text-right text-ink">{auditoria.observaciones_generales ?? auditoria.observacionesGenerales}</span></div>
            )}
            {respuestas.map((item, index) => (
              <div key={item.item_numero ?? item.itemNumero ?? index} className="flex justify-between gap-3 border-b border-border py-3 text-label last:border-b-0"><span className="text-text-muted">{item.criterio_nombre ?? item.criterioNombre ?? `Punto ${item.item_numero ?? index + 1}`}</span><span className="text-right text-ink">{item.resultado_item ?? item.resultadoItem ?? '—'}</span></div>
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
      return <section className="overflow-hidden rounded-xl border border-border bg-surface"><div className="border-b border-border px-4 py-3 text-h2">Historial</div><div className="px-4 py-2">{historial.map((evento) => <div key={`${evento.fecha}-${evento.texto}`} className="flex gap-8 border-b border-border py-3 text-label last:border-b-0"><span className="w-28 shrink-0 text-text-muted">{formatDateTime(evento.fecha)}</span><span>{evento.texto}</span></div>)}</div></section>;
    }

    const montoTexto = monto != null ? `$${Number(monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—';
    const calidadTexto =
      auditoria?.resultado != null
        ? resultadoCalidadLabels[auditoria.resultado] || auditoria.resultado
        : 'Pendiente';
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
        <aside className="h-fit rounded-xl border border-border bg-surface p-4"><span className="text-label text-text-secondary">Avance</span><div className="mt-3 text-2xl font-semibold text-ink">{fases.length === 0 ? '—' : fases.length}</div><p className="text-metadata text-text-muted">fases planificadas</p><div className="mt-3 rounded-lg bg-info-light px-3 py-3 text-metadata text-info">{estadoLabels[estado] || 'En producción'}.</div></aside>
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
        ['Fecha de entrega solicitada', formatDate(fechaSolicitada)],
      ].map(([label, value]) => <div key={label} className="border-b border-border px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><p className="text-metadata text-text-muted">{label}</p><p className="mt-1 text-label font-semibold text-ink">{value}</p></div>)}</div>
      <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-border bg-canvas p-1">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-3 py-2 text-metadata ${activeTab === tab ? 'bg-surface text-ink shadow-sm' : 'text-text-secondary hover:bg-surface/70'}`}>{tab}</button>)}</div>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};
