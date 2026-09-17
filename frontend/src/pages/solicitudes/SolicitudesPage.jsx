import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import { Badge, Button, Card, CardHeader, CardTitle, DataTable, EmptyState, ErrorBanner, LoadingSpinner, Title } from '../../components/ui';

const estadoSolicitud = {
  PENDIENTE_COTIZACION: { variant: 'pending', label: 'Pendiente de cotización' },
  COTIZADA: { variant: 'quoted', label: 'Cotizada' },
};

export const SolicitudesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { solicitudes, cargando, error, recargar } = useSolicitudes();
  // El backend no devuelve vendedor_id: si falta, se muestra todo
  // (el servidor ya filtra por PENDIENTE_COTIZACION).
  const solicitudesVisibles = user?.rol === 'VENDEDOR'
    ? solicitudes.filter((item) => item.vendedor_id == null || item.vendedor_id === user.id)
    : solicitudes;

  const columns = useMemo(() => [
    { accessorKey: 'numero_solicitud', header: 'Número' },
    { accessorKey: 'cliente_razon_social', header: 'Cliente' },
    { accessorKey: 'descripcion_pieza', header: 'Pieza o trabajo' },
    {
      accessorKey: 'fecha_esperada_entrega',
      header: 'Entrega esperada',
      cell: ({ getValue }) => getValue() || 'Sin fecha',
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ getValue }) => {
        const estado = estadoSolicitud[getValue()] || { variant: 'queue', label: getValue().replace(/_/g, ' ') };
        return <Badge variant={estado.variant} type="inline">{estado.label}</Badge>;
      },
    },
  ], []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Solicitudes</Title>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">Solicitudes</h1>
          <p className="mt-1 text-body text-text-secondary">Pedidos de cotización cargados por el equipo comercial.</p>
        </div>
        {user?.rol === 'VENDEDOR' && (
          <Button onClick={() => navigate('/solicitudes/nueva')}>
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pedidos registrados</CardTitle>
        </CardHeader>
        {cargando ? (
          <LoadingSpinner label="Cargando solicitudes" />
        ) : error ? (
          <ErrorBanner message={error} onRetry={recargar} />
        ) : solicitudesVisibles.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin solicitudes pendientes"
            description="Cuando el equipo comercial cargue pedidos, apareceran aqui."
            action={user?.rol === 'VENDEDOR' ? (
              <Button onClick={() => navigate('/solicitudes/nueva')} className="mt-2">
                <Plus className="h-4 w-4" />
                Nueva solicitud
              </Button>
            ) : null}
          />
        ) : (
          <DataTable
            columns={columns}
            data={solicitudesVisibles}
            searchable
            searchPlaceholder="Buscar por numero o cliente..."
            footer={`${solicitudesVisibles.length} ${solicitudesVisibles.length !== 1 ? 'solicitudes' : 'solicitud'}`}
          />
        )}
      </Card>
    </div>
  );
};
