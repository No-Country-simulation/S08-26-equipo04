import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, Card, DataTable, EmptyState, ErrorBanner, SkeletonTable } from '../../components/ui';
import { formatDate } from '../../api/helpers';
import { useOrdenesTrabajo } from '../../hooks/useOrdenesTrabajo';

const estadoLabel = {
  EN_PRODUCCION: 'En producción',
  EN_CALIDAD: 'En calidad',
  NO_CONFORME: 'No conforme',
  DESPACHO: 'Lista para entregar',
  ENTREGADA: 'Entregada',
};

const estadoVariant = {
  EN_PRODUCCION: 'production',
  EN_CALIDAD: 'quality',
  NO_CONFORME: 'quality',
  DESPACHO: 'pending',
  ENTREGADA: 'approved',
};

export const OrdenesTrabajoPage = () => {
  const { ordenesTrabajo, cargando, error, recargar } = useOrdenesTrabajo();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroEstado = searchParams.get('estado') || 'todos';

  const filasVisibles = useMemo(() => {
    return ordenesTrabajo.filter((ot) => {
      const coincideEstado = filtroEstado === 'todos' || ot.estado === filtroEstado;
      return coincideEstado;
    });
  }, [filtroEstado, ordenesTrabajo]);

  const cambiarEstado = (event) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value === 'todos') next.delete('estado');
    else next.set('estado', value);
    setSearchParams(next);
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'numero_ot',
      header: 'Orden de trabajo',
      cell: ({ row }) => (
        <Link
          to={`/ordenes-trabajo/${row.original.numero_ot}`}
          className="font-semibold text-primary hover:underline"
        >
          {row.original.numero_ot}
        </Link>
      ),
    },
    { accessorKey: 'cliente_razon_social', header: 'Cliente' },
    { accessorKey: 'descripcion_pieza', header: 'Pieza o trabajo' },
    { accessorKey: 'cantidad', header: 'Cantidad' },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ getValue }) => {
        const estado = getValue();
        return (
          <Badge variant={estadoVariant[estado] || 'pending'} type="inline">
            {estadoLabel[estado] || estado}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'fecha_esperada_entrega',
      header: 'Entrega solicitada',
      cell: ({ getValue }) => formatDate(getValue()),
    },
  ], []);

  return (
    <div className="mx-auto max-w-[1360px]">
    <h1 className="mb-6 text-h1 text-ink">Órdenes de trabajo</h1>

    <div className="mb-4 flex flex-wrap items-center gap-2">
      <select
        value={filtroEstado}
        onChange={cambiarEstado}
        aria-label="Filtrar por estado"
        className="select h-[44px] w-[180px] py-1 text-body"
      >
        <option value="todos">Todos los estados</option>
        <option value="EN_PRODUCCION">En producción</option>
        <option value="EN_CALIDAD">En calidad</option>
        <option value="NO_CONFORME">No conforme</option>
        <option value="DESPACHO">Lista para entregar</option>
        <option value="ENTREGADA">Entregada</option>
      </select>
    </div>

    <Card>
      {cargando ? (
        <SkeletonTable columns={6} rows={5} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={recargar} />
      ) : filasVisibles.length === 0 ? (
        <EmptyState
          title="No hay órdenes de trabajo"
          description="Las órdenes aparecerán cuando una solicitud aprobada genere una orden de trabajo."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filasVisibles}
          searchable
          searchPlaceholder="Buscar por OT, cliente o pieza..."
          footer={`${filasVisibles.length} ${filasVisibles.length === 1 ? 'orden' : 'órdenes'}`}
        />
      )}
    </Card>
    </div>
  );
};
