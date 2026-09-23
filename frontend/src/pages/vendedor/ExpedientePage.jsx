import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formatDate } from '../../api/helpers';
import { useOrdenesTrabajo } from '../../hooks/useOrdenesTrabajo';

const tabs = ['Resumen', 'Documentos', 'Hoja de ruta', 'Calidad', 'Entrega', 'Historial'];

const firstOrder = {
  numero_ot: 'OT-2026-0034',
  cliente_razon_social: 'Hidráulica Norte',
  descripcion_pieza: 'Cuerpo de válvula bridada',
  cantidad: 12,
  estado: 'EN_PRODUCCION',
  fecha_esperada_entrega: '2026-09-24',
};

const routePhases = [
  { number: '01', name: 'Preparación', detail: 'Laura Díaz · 38 min', state: 'Terminada', time: '07/09, 09:18' },
  { number: '02', name: 'Mecanizado CNC', detail: 'Mario Silva · inició 10:04', state: 'En ejecución', time: 'Vence en 2 h 14 min' },
  { number: '03', name: 'Control dimensional', detail: 'Iván Soto', state: 'En cola', time: '—' },
];

const documents = [{ name: 'plano_valvula_v03.pdf', type: 'Plano', size: '2.4 MB' }];
const history = [
  ['07/09 · 10:04', 'Mecanizado CNC iniciado por Mario Silva'],
  ['07/09 · 09:18', 'Preparación terminada por Laura Díaz'],
  ['06/09 · 17:42', 'Orden de trabajo generada'],
];

const estadoLabels = {
  EN_PRODUCCION: 'En producción',
  EN_CALIDAD: 'En calidad',
  NO_CONFORME: 'No conforme',
  DESPACHO: 'Lista para entregar',
  ENTREGADA: 'Entregada',
};

export const ExpedientePage = () => {
  const { id } = useParams();
  const { ordenesTrabajo, cargando } = useOrdenesTrabajo();
  const [activeTab, setActiveTab] = useState('Resumen');

  const ordenSeleccionada = useMemo(() => {
    const encontrada = ordenesTrabajo.find(
      (ot) => ot.id === Number(id) || ot.numero_ot === id,
    );
    return encontrada || (id === firstOrder.numero_ot ? firstOrder : ordenesTrabajo[0] || firstOrder);
  }, [id, ordenesTrabajo]);

  if (cargando || !ordenSeleccionada) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-text-secondary">Cargando expediente...</div>;
  }

  const estado = estadoLabels[ordenSeleccionada.estado] || 'En producción';

  const renderContent = () => {
    if (activeTab === 'Documentos') {
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3 text-h2">Documentos vinculados</div>
          <div className="space-y-2 p-4">
            {documents.map((documento) => (
              <div key={documento.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1"><p className="text-label font-semibold text-ink">{documento.name}</p><p className="text-metadata text-text-muted">{documento.type}</p></div>
                <span className="text-metadata text-text-muted">PDF · {documento.size}</span>
                <button type="button" className="p-1 text-text-secondary" aria-label={`Descargar ${documento.name}`}><Download className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === 'Hoja de ruta') {
      return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4 text-h2">Hoja de ruta</div>
          <div className="space-y-3 p-5">
            {routePhases.map((phase) => (
              <div key={phase.number} className="grid min-h-[68px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border px-4 py-3 sm:grid-cols-[40px_minmax(0,1fr)_140px_120px] sm:gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-tint text-metadata font-semibold text-primary">{phase.number}</span>
                <div className="min-w-0"><p className="text-label font-semibold text-ink">{phase.name}</p><p className="text-metadata text-text-muted">{phase.detail}</p></div>
                <span className="text-metadata text-text-secondary">{phase.state}</span>
                <span className="text-left text-metadata text-text-muted sm:text-right">{phase.time}</span>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === 'Calidad') {
      return <section className="overflow-hidden rounded-xl border border-border bg-surface"><div className="border-b border-border px-4 py-3 text-h2">Control de Calidad</div><div className="m-4 rounded-lg bg-info-light px-3 py-3 text-label text-info">Disponible cuando terminen las fases de producción.</div></section>;
    }

    if (activeTab === 'Entrega') {
      return <section className="overflow-hidden rounded-xl border border-border bg-surface"><div className="flex items-center justify-between border-b border-border px-4 py-3 text-h2"><span>Entrega</span><span className="badge badge-queue">Pendiente</span></div><div className="px-4 py-2"><div className="flex border-b border-border py-3 text-label"><span className="w-36 text-text-muted">Fecha de entrega</span><span>—</span></div><div className="flex py-3 text-label"><span className="w-36 text-text-muted">Persona que recibe</span><span>—</span></div></div></section>;
    }

    if (activeTab === 'Historial') {
      return <section className="overflow-hidden rounded-xl border border-border bg-surface"><div className="border-b border-border px-4 py-3 text-h2">Historial</div><div className="px-4 py-2">{history.map(([date, event]) => <div key={date} className="flex gap-8 border-b border-border py-3 text-label last:border-b-0"><span className="w-28 shrink-0 text-text-muted">{date}</span><span>{event}</span></div>)}</div></section>;
    }

    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_280px]">
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3 text-h2">Información del trabajo</div>
          <div className="px-4 py-2">{[
            ['Solicitud', 'SOL-2026-0047'],
            ['Cotización aprobada', 'COT-2026-0039'],
            ['Contacto', 'Carla Gómez · +54 272 555 0182'],
            ['Descripción', `${ordenSeleccionada.descripcion_pieza}, ${ordenSeleccionada.cantidad} unidades`],
          ].map(([label, value], index, values) => <div key={label} className={`flex justify-between gap-3 py-3 text-label ${index < values.length - 1 ? 'border-b border-border' : ''}`}><span className="text-text-muted">{label}</span><span className="text-right text-ink">{value}</span></div>)}</div>
        </section>
        <aside className="rounded-xl border border-border bg-surface p-4"><span className="text-label text-text-secondary">Avance</span><div className="mt-3 text-2xl font-semibold text-ink">1 de 3</div><p className="text-metadata text-text-muted">fases terminadas</p><div className="mt-3 rounded-lg bg-info-light px-3 py-3 text-metadata text-info">Mecanizado CNC en ejecución.</div></aside>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1360px]">
      <Link to="/ordenes-trabajo" className="text-metadata text-primary hover:underline">← Volver a Órdenes de trabajo</Link>
      <div className="mt-3 flex items-center gap-3"><h1 className="text-h1 text-ink">{ordenSeleccionada.numero_ot}</h1><span className="badge badge-production">● {estado}</span></div>
      <div className="mt-6 grid overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-4">{[
        ['Cliente', ordenSeleccionada.cliente_razon_social],
        ['Trabajo', ordenSeleccionada.descripcion_pieza],
        ['Cantidad', `${ordenSeleccionada.cantidad} piezas`],
        ['Fecha de entrega solicitada', formatDate(ordenSeleccionada.fecha_esperada_entrega)],
      ].map(([label, value]) => <div key={label} className="border-b border-border px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><p className="text-metadata text-text-muted">{label}</p><p className="mt-1 text-label font-semibold text-ink">{value}</p></div>)}</div>
      <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-border bg-canvas p-1">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg px-3 py-2 text-metadata ${activeTab === tab ? 'bg-surface text-ink shadow-sm' : 'text-text-secondary hover:bg-surface/70'}`}>{tab}</button>)}</div>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};
