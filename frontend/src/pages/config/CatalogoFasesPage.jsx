import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Users } from 'lucide-react';
import { mocks } from '../../mocks';
import { Button, Card, CardHeader, CardTitle, DataTable, Toggle, Title } from '../../components/ui';
import { FaseFormModal } from '../../components/FaseFormModal';
import { toast } from 'sonner';

export const CatalogoFasesPage = () => {
  const navigate = useNavigate();
  const [fases, setFases] = useState(mocks.fases);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFase, setEditingFase] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setEditingFase(null);
    setModalOpen(true);
  };

  const handleEdit = (fase) => {
    setEditingFase(fase);
    setModalOpen(true);
  };

  const handleSubmit = (data) => {
    setSaving(true);
    setTimeout(() => {
      if (editingFase) {
        setFases((prev) =>
          prev.map((f) =>
            f.id === editingFase.id
              ? { ...f, ...data, updated_at: new Date().toISOString() }
              : f
          )
        );
        toast.success('Fase actualizada correctamente');
      } else {
        const newFase = {
          id: Math.max(...fases.map((f) => f.id)) + 1,
          ...data,
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setFases((prev) => [...prev, newFase]);
        toast.success('Fase creada correctamente');
      }
      setSaving(false);
      setModalOpen(false);
    }, 400);
  };

  const handleToggleActivo = (fase) => {
    setFases((prev) =>
      prev.map((f) =>
        f.id === fase.id
          ? { ...f, activo: !f.activo, updated_at: new Date().toISOString() }
          : f
      )
    );
    toast.success(fase.activo ? 'Fase desactivada' : 'Fase activada');
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
        {fases.length === 0 ? (
          <p className="py-8 text-center text-body text-text-muted">
            No hay fases configuradas
          </p>
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
