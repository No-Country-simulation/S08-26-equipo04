import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import { Badge, Card, DataTable, Title } from '../../components/ui';

const estadoBadge = {
  LISTA_PARA_ENVIAR: 'pending',
  ENVIADA_A_CLIENTE: 'quoted',
  APROBADA: 'approved',
  NO_APROBADA: 'production',
};

const estadoLabels = {
  ENVIADA_A_CLIENTE: 'Enviada al cliente',
  APROBADA: 'Aprobada',
  NO_APROBADA: 'No aprobada',
  LISTA_PARA_ENVIAR: 'Lista para enviar',
};

export const CotizacionesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cotizaciones } = useCotizaciones();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('TODOS');

  const cotizacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return cotizaciones.filter((c) => {
      const coincideTexto = !texto || [c.numero_cotizacion, c.cliente_razon_social, c.solicitud_numero, c.pieza_trabajo]
        .some((v) => v?.toLowerCase().includes(texto));
      const coincideEstado = estado === 'TODOS' || c.estado === estado;
      return coincideTexto && coincideEstado;
    });
  }, [cotizaciones, busqueda, estado]);

  const columns = useMemo(() => [
    {
      accessorKey: 'numero_cotizacion',
      header: 'Cotización',
      cell: ({ row }) => {
        const cot = row.original;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(cot.estado === 'LISTA_PARA_ENVIAR' && user?.rol === 'JEFE_PRODUCCION'
                ? `/cotizaciones/${cot.id}/editar`
                : `/cotizaciones/${cot.id}`);
            }}
            className="font-medium text-primary hover:underline"
            aria-label={`${cot.estado === 'LISTA_PARA_ENVIAR' && user?.rol === 'JEFE_PRODUCCION' ? 'Editar' : 'Ver'} ${cot.numero_cotizacion}`}
          >
            {cot.numero_cotizacion}
          </button>
        );
      },
    },
    { accessorKey: 'solicitud_numero', header: 'Solicitud' },
    { accessorKey: 'cliente_razon_social', header: 'Cliente' },
    {
      accessorKey: 'pieza_trabajo',
      header: 'Pieza o trabajo',
      cell: ({ getValue }) => getValue() || 'Trabajo metalúrgico',
    },
    {
      accessorKey: 'precio_final',
      header: 'Precio',
      cell: ({ getValue }) => `$${getValue().toLocaleString('es-AR')}`,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ getValue }) => (
        <Badge variant={estadoBadge[getValue()] || 'pending'} type="inline">
          {estadoLabels[getValue()] || getValue().replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Actualizada',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('es-AR'),
    },
  ], [navigate, user?.rol]);

  const handleRowClick = (row) => {
    navigate(row.estado === 'LISTA_PARA_ENVIAR' && user?.rol === 'JEFE_PRODUCCION'
      ? `/cotizaciones/${row.id}/editar`
      : `/cotizaciones/${row.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Cotizaciones</Title>
      <div>
        <h1 className="text-h1 text-ink">Cotizaciones</h1>
        {user?.rol === 'VENDEDOR' && (
          <p className="mt-1 text-body text-text-secondary">
            Revisa las cotizaciones y registra la respuesta del cliente.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            className="input pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cotización, cliente o pieza"
            aria-label="Buscar cotizaciones"
          />
        </label>
        <select
          className="select sm:max-w-xs"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="ENVIADA_A_CLIENTE">Enviada al cliente</option>
          <option value="APROBADA">Aprobada</option>
          <option value="NO_APROBADA">No aprobada</option>
          <option value="LISTA_PARA_ENVIAR">Lista para enviar</option>
        </select>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={cotizacionesFiltradas}
          onRowClick={handleRowClick}
          footer={`${cotizacionesFiltradas.length} cotización${cotizacionesFiltradas.length !== 1 ? 'es' : ''}`}
        />
      </Card>
    </div>
  );
};
