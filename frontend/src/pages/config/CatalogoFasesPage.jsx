import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Users, Inbox } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../api';
import { Button, Card, CardHeader, CardTitle, DataTable, EmptyState, ErrorBanner, Toggle, Title } from '../../components/ui';
import { FaseFormModal } from '../../components/FaseFormModal';
import { toast } from 'sonner';

export const CatalogoFasesPage = () => {
  const navigate = useNavigate();
  const [fases, setFases] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFase, setEditingFase] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet('/api/fases')
      .then(({ data }) => setFases(data ?? []))
      .catch((err) => setError(err?.response?.data?.message || 'No se pudieron cargar las fases.'));
  }, []);

  const handleCreate = () => {
    setEditingFase(null);
    setModalOpen(true);
  };

  const handleEdit = (fase) => {
    setEditingFase(fase);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const response = editingFase
        ? await apiPut(`/api/fases/${editingFase.id}`, data)
        : await apiPost('/api/fases', data);
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

  const handleToggleActivo = async (fase) => {
    try {
      const { data } = await apiPut(`/api/fases/${fase.id}`, {
        ...fase,
        activo: !fase.activo,
      });
      setFases((prev) => prev.map((item) => item.id === fase.id ? data : item));
      toast.success(fase.activo ? 'Fase desactivada' : 'Fase activada');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'No se pudo cambiar el estado de la fase.');
    }
  };

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
  ], [navigate]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Catálogo de fases</Title>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h1 text-ink">Catalogo de fases</h1>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nueva fase
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fases registradas</CardTitle>
        </CardHeader>
        {error ? <ErrorBanner message={error} /> : fases.length === 0 ? (
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
