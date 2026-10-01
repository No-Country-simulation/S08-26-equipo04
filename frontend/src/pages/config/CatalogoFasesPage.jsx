import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Users, Inbox, RefreshCw } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../api';
import { Button, Card, CardHeader, CardTitle, DataTable, EmptyState, ErrorBanner, SkeletonTable, Toggle, Title } from '../../components/ui';
import { FaseFormModal } from '../../components/FaseFormModal';
import { toast } from 'sonner';

export const CatalogoFasesPage = () => {
  const navigate = useNavigate();
  const [fases, setFases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFase, setEditingFase] = useState(null);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    apiGet('/api/fases')
      .then(({ data }) => {
        if (cancelado) return;
        setFases(data ?? []);
        setError(null);
        setCargando(false);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(err?.response?.data?.message || 'No se pudieron cargar las fases.');
        setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [version]);

  const recargar = () => {
    setError(null);
    setCargando(true);
    setVersion((v) => v + 1);
  };

  const handleCreate = () => {
    setEditingFase(null);
    setModalOpen(true);
  };

  const handleEdit = useCallback((fase) => {
    setEditingFase(fase);
    setModalOpen(true);
  }, []);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      // Al crear, el backend exige operarios_ids (al menos uno); al editar
      // los operarios no se tocan (pantalla de operarios por fase).
      const response = editingFase
        ? await apiPut(`/api/fases/${editingFase.id}`, {
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
          })
        : await apiPost('/api/fases', {
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            operarios_ids: data.operarios_ids,
          });
      if (editingFase) {
        setFases((prev) =>
          prev.map((f) =>
            f.id === editingFase.id
              ? response.data
              : f
          )
        );
        toast.success('Fase actualizada correctamente');
      } else {
        setFases((prev) => [...prev, response.data]);
        toast.success('Fase creada correctamente');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'No se pudo guardar la fase.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = useCallback(async (fase) => {
    try {
      const { data } = await apiPut(`/api/fases/${fase.id}`, {
        ...fase,
        activo: !fase.activo,
      });
      // Update optimista local (sin refetch): no altera el orden ni la
      // pagina actual del DataTable (ver FE-275: autoResetPageIndex off).
      setFases((prev) => prev.map((item) => item.id === fase.id ? data : item));
      toast.success(fase.activo ? 'Fase desactivada' : 'Fase activada');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'No se pudo cambiar el estado de la fase.');
    }
  }, []);

  const columns = useMemo(() => [
    {
      accessorKey: 'codigo',
      header: 'Codigo',
      cell: ({ getValue }) => <span className="font-medium text-ink">{getValue()}</span>,
    },
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      accessorKey: 'descripcion',
      header: 'Descripcion',
      cell: ({ getValue }) => (
        <span className="max-w-xs truncate text-text-secondary">
          {getValue() || '\u2014'}
        </span>
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      enableSorting: false,
      cell: ({ row }) => (
        <Toggle
          checked={row.original.activo}
          onChange={() => handleToggleActivo(row.original)}
          label={row.original.activo ? 'Activa' : 'Inactiva'}
        />
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
            className="hover:text-ink"
            aria-label={`Editar ${row.original.nombre}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/config/fases/${row.original.id}/operarios`);
            }}
            className="hover:text-primary"
            aria-label={`Operarios de ${row.original.nombre}`}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [navigate, handleToggleActivo, handleEdit]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Catálogo de fases</Title>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h1 text-ink">Catalogo de fases</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={recargar}
            aria-label="Actualizar fases"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Nueva fase
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fases registradas</CardTitle>
        </CardHeader>
        {error ? <ErrorBanner message={error} onRetry={recargar} /> : cargando ? (
          <SkeletonTable columns={5} rows={5} />
        ) : fases.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin fases configuradas"
            description="Cuando se creen fases de producción, aparecerán aquí."
          />
        ) : (
          <DataTable
            columns={columns}
            data={fases}
            searchable
            searchPlaceholder="Buscar por codigo o nombre..."
            footer={`${fases.length} fase${fases.length !== 1 ? 's' : ''}`}
          />
        )}
      </Card>

      <FaseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingFase}
        loading={saving}
      />
    </div>
  );
};
