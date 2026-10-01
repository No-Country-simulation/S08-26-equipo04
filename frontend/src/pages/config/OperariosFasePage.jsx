import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { apiGet, apiPost, extractApiMessage } from '../../api';
import { Button, Card, CardHeader, CardTitle, DataTable, ErrorBanner, SkeletonTable, Toggle, Title } from '../../components/ui';
import { toast } from 'sonner';

export const OperariosFasePage = () => {
  const { faseId } = useParams();
  const navigate = useNavigate();

  const [fase, setFase] = useState(null);
  const [operarios, setOperarios] = useState([]);
  // Habilitados reales (GET /api/fases/{id}/operarios): el endpoint solo
  // devuelve los habilitados, el resto se muestra como "No habilitado".
  const [habilitados, setHabilitados] = useState(() => new Set());
  const [detallePorId, setDetallePorId] = useState(() => new Map());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  const [toggleEnCurso, setToggleEnCurso] = useState(null);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelado = false;
    Promise.all([
      apiGet('/api/fases'),
      apiGet('/api/usuarios'),
      apiGet(`/api/fases/${faseId}/operarios`),
    ]).then(
      ([fases, usuarios, opsHabilitados]) => {
        if (cancelado) return;
        setFase((fases.data ?? []).find((item) => item.id === Number(faseId)) ?? null);
        setOperarios(usuarios.data ?? []);
        const lista = opsHabilitados.data ?? [];
        setHabilitados(new Set(lista.map((item) => item.id)));
        setDetallePorId(new Map(lista.map((item) => [item.id, item])));
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        setError(extractApiMessage(err, 'No se pudieron cargar los operarios de la fase.'));
        setCargando(false);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [faseId, version]);

  const reintentar = () => {
    setError(null);
    setCargando(true);
    setVersion((v) => v + 1);
  };

  const handleToggle = useCallback(async (operarioId) => {
    const estaHabilitado = habilitados.has(operarioId);
    // El backend no exige minimo, pero una fase sin operarios queda
    // inutilizable para el Jefe: se bloquea en el front con aviso.
    if (estaHabilitado && habilitados.size <= 1) {
      toast.warning('La fase debe tener al menos un operario habilitado.');
      return;
    }
    setToggleEnCurso(operarioId);
    try {
      await apiPost(`/api/fases/${faseId}/habilitar`, {
        operario_id: operarioId,
        habilitado: !estaHabilitado,
      });
    } catch (err) {
      toast.error(extractApiMessage(err, 'No se pudo actualizar la habilitación.'));
      return;
    } finally {
      setToggleEnCurso(null);
    }
    setHabilitados((prev) => {
      const siguiente = new Set(prev);
      if (estaHabilitado) {
        siguiente.delete(operarioId);
      } else {
        siguiente.add(operarioId);
      }
      return siguiente;
    });

    const operario = operarios.find((o) => o.id === operarioId);
    toast.success(
      estaHabilitado
        ? `${operario?.nombre ?? 'Operario'} deshabilitado de esta fase`
        : `${operario?.nombre ?? 'Operario'} habilitado para esta fase`
    );
  }, [habilitados, faseId, operarios]);

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
      // GET /api/usuarios no trae especialidad: se completa con el detalle
      // de habilitados (OperarioDTO) cuando esta disponible.
      cell: ({ row, getValue }) => (
        <span className="text-text-secondary">
          {getValue() ?? detallePorId.get(row.original.id)?.tipo_tarea ?? '—'}
        </span>
      ),
    },
    {
      id: 'habilitado',
      header: 'Habilitado',
      enableSorting: false,
      cell: ({ row }) => {
        const operario = row.original;
        const isHabilitado = habilitados.has(operario.id);
        return (
          <Toggle
            checked={isHabilitado}
            disabled={toggleEnCurso === operario.id}
            onChange={() => handleToggle(operario.id)}
            label={isHabilitado ? 'Habilitado' : 'No habilitado'}
          />
        );
      },
    },
  ], [habilitados, detallePorId, toggleEnCurso, handleToggle]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Title>Operarios</Title>
        <Button variant="discrete" onClick={() => navigate('/config/fases')}>
          <ArrowLeft className="h-4 w-4" />
          Volver al catalogo
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Operarios del sistema</CardTitle>
          </CardHeader>
          <SkeletonTable columns={4} rows={5} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Title>Operarios</Title>
        <Button variant="discrete" onClick={() => navigate('/config/fases')}>
          <ArrowLeft className="h-4 w-4" />
          Volver al catalogo
        </Button>
        <ErrorBanner message={error} onRetry={reintentar} />
      </div>
    );
  }

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
        <Button
          variant="secondary"
          onClick={reintentar}
          aria-label="Actualizar operarios"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
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
