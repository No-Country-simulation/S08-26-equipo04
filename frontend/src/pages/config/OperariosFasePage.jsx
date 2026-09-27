import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiGet, apiPost } from '../../api';
import { Button, Card, CardHeader, CardTitle, DataTable, Toggle, Title } from '../../components/ui';
import { toast } from 'sonner';

export const OperariosFasePage = () => {
  const { faseId } = useParams();
  const navigate = useNavigate();

  const [fase, setFase] = useState(null);
  const [operarios, setOperarios] = useState([]);
  useEffect(() => {
    Promise.all([apiGet('/api/fases'), apiGet('/api/usuarios')]).then(([fases, usuarios]) => {
      setFase((fases.data ?? []).find((item) => item.id === Number(faseId)) ?? null);
      setOperarios(usuarios.data ?? []);
    }).catch(() => {
      setFase(null);
      setOperarios([]);
    });
  }, [faseId]);

  const [asignaciones, setAsignaciones] = useState(() => {
    return {};
  });

  const handleToggle = useCallback(async (operarioId) => {
    const habilitado = asignaciones[operarioId] !== true;
    try {
      await apiPost(`/api/fases/${faseId}/habilitar`, { operarioId, habilitado });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'No se pudo actualizar la habilitación.');
      return;
    }
    setAsignaciones((prev) => {
      const isCurrentlyEnabled = prev[operarioId] === true;
      return { ...prev, [operarioId]: !isCurrentlyEnabled };
    });

    const operario = operarios.find((o) => o.id === operarioId);
    const wasEnabled = asignaciones[operarioId] === true;
    toast.success(
      wasEnabled
        ? `${operario.nombre} deshabilitado de esta fase`
        : `${operario.nombre} habilitado para esta fase`
    );
  }, [asignaciones, faseId, operarios]);

  const columns = useMemo(() => [
    {
      accessorKey: 'nombre',
      header: 'Operario',
      cell: ({ getValue }) => <span className="font-medium text-ink">{getValue()}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => <span className="text-text-secondary">{getValue()}</span>,
    },
    {
      accessorKey: 'tipo_tarea',
      header: 'Especialidad',
      cell: ({ getValue }) => <span className="text-text-secondary">{getValue() || '\u2014'}</span>,
    },
    {
      id: 'habilitado',
      header: 'Habilitado',
      enableSorting: false,
      cell: ({ row }) => {
        const operario = row.original;
        const isHabilitado = asignaciones[operario.id] === true;
        return (
          <Toggle
            checked={isHabilitado}
            onChange={() => handleToggle(operario.id)}
            label={isHabilitado ? 'Habilitado' : 'No habilitado'}
          />
        );
      },
    },
  ], [asignaciones, handleToggle]);

  if (!fase) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Title>Operarios</Title>
        <Button variant="discrete" onClick={() => navigate('/config/fases')}>
          <ArrowLeft className="h-4 w-4" />
          Volver al catalogo
        </Button>
        <Card>
          <p className="py-8 text-center text-body text-text-muted">
            Fase no encontrada
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Operarios — {fase.nombre}</Title>
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="discrete"
            onClick={() => navigate('/config/fases')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catalogo
          </Button>
          <h1 className="text-h1 text-ink">
            Operarios — {fase.nombre}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operarios del sistema</CardTitle>
        </CardHeader>
        <DataTable
          columns={columns}
          data={operarios}
          searchable
          searchPlaceholder="Buscar por nombre o email..."
          footer={`${operarios.length} operario${operarios.length !== 1 ? 's' : ''}`}
        />
      </Card>
    </div>
  );
};
