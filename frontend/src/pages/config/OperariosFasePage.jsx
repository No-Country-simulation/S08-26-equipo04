import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mocks } from '../../mocks';
import { Button, Card, CardHeader, CardTitle, DataTable, Toggle, Title } from '../../components/ui';
import { toast } from 'sonner';

export const OperariosFasePage = () => {
  const { faseId } = useParams();
  const navigate = useNavigate();

  const fase = useMemo(
    () => mocks.fases.find((f) => f.id === Number(faseId)),
    [faseId]
  );

  const operarios = useMemo(
    () => mocks.usuarios.filter((u) => u.rol === 'OPERARIO'),
    []
  );

  const [asignaciones, setAsignaciones] = useState(() => {
    const initial = {};
    mocks.faseOperarios
      .filter((fo) => fo.fase_catalogo_id === Number(faseId))
      .forEach((fo) => {
        initial[fo.operario_id] = fo.habilitado;
      });
    return initial;
  });

  const handleToggle = (operarioId) => {
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
  };

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
  ], [asignaciones, operarios]);

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
