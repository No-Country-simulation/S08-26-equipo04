import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const rows = [
  {
    numero_ot: 'OT-2026-0034',
    cliente: 'Hidráulica Norte',
    pieza: 'Cuerpo de válvula brida',
    cantidad: 12,
    avance: '1 de 3 fases',
    estado: 'En producción',
    fecha: '24/09/2026',
    estadoColor: 'bg-info',
  },
  {
    numero_ot: 'OT-2026-0032',
    cliente: 'Industrias Álamo',
    pieza: 'Rodillo guía templado',
    cantidad: 6,
    avance: '3 de 3 fases',
    estado: 'En calidad',
    fecha: '17/09/2026',
    estadoColor: 'bg-warning',
  },
  {
    numero_ot: 'OT-2026-0028',
    cliente: 'Equipos Monarca',
    pieza: 'Buje de apoyo',
    cantidad: 30,
    avance: '3 de 3 fases',
    estado: 'Lista para entregar',
    fecha: '12/09/2026',
    estadoColor: 'bg-success',
  },
];

export const OrdenesTrabajoPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const filasVisibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return rows.filter((ot) => {
      const coincideEstado = filtroEstado === 'todos' || ot.estado === filtroEstado;
      const coincideTexto = [ot.numero_ot, ot.cliente, ot.pieza].some((valor) =>
        valor.toLowerCase().includes(texto),
      );

      return coincideEstado && coincideTexto;
    });
  }, [busqueda, filtroEstado]);

  return (
    <div className="mx-auto max-w-[1360px]">
    <h1 className="mb-6 text-h1 text-ink">Órdenes de trabajo</h1>

    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-[480px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por OT, cliente o pieza"
          aria-label="Buscar por OT, cliente o pieza"
          className="input h-[44px] pl-10 pr-3 text-body"
        />
      </div>

      <select
        value={filtroEstado}
        onChange={(event) => setFiltroEstado(event.target.value)}
        aria-label="Filtrar por estado"
        className="select h-[44px] w-[180px] py-1 text-body"
      >
        <option value="todos">Todos los estados</option>
        <option value="En producción">En producción</option>
        <option value="En calidad">En calidad</option>
        <option value="Lista para entregar">Lista para entregar</option>
      </select>
    </div>

    <div className="overflow-hidden rounded-xl border border-border bg-canvas">
      <table className="min-w-full border-separate border-spacing-0 text-left text-label text-ink">
        <thead className="bg-canvas text-label font-medium text-text-secondary">
          <tr>
            <th className="border-b border-border px-5 py-4 text-left font-medium">Orden de trabajo</th>
            <th className="border-b border-border px-5 py-4 text-left font-medium">Cliente</th>
            <th className="border-b border-border px-5 py-4 text-left font-medium">Pieza o trabajo</th>
            <th className="border-b border-border px-5 py-4 text-left font-medium">Cantidad</th>
            <th className="border-b border-border px-5 py-4 text-left font-medium">Avance</th>
            <th className="border-b border-border px-5 py-4 text-left font-medium">Estado</th>
            <th className="border-b border-border px-5 py-4 text-left font-medium">Entrega solicitada</th>
          </tr>
        </thead>
        <tbody className="bg-surface">
          {filasVisibles.map((ot) => (
            <tr key={ot.numero_ot} className="border-b border-border bg-surface">
              <td className="px-5 py-4 text-label font-semibold">
                <Link
                  to={`/ordenes-trabajo/${ot.numero_ot}`}
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                >
                  {ot.numero_ot}
                </Link>
              </td>
              <td className="px-5 py-4 text-body">{ot.cliente}</td>
              <td className="px-5 py-4 text-body">{ot.pieza}</td>
              <td className="px-5 py-4 text-body">{ot.cantidad}</td>
              <td className="px-5 py-4 text-body">{ot.avance}</td>
              <td className="px-5 py-4 text-body">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-3 w-3 rounded-full ${ot.estadoColor}`} />
                  <span>{ot.estado}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-body">{ot.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-4 border-t border-border bg-canvas px-5 py-4 text-metadata text-text-secondary">
        <span className="text-primary">1–{Math.min(3, filasVisibles.length)} de 14 órdenes</span>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-label ${
                page === 1
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-text-secondary'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};
