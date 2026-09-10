import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Users } from 'lucide-react';
import { mocks } from '../../mocks';
import { Button, Card, CardHeader, CardTitle, Toggle } from '../../components/ui';
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label text-primary">Configuracion</p>
          <h1 className="mt-1 text-h1 text-ink">Catalogo de fases</h1>
          <p className="mt-2 text-body text-text-secondary">
            Gestiona las fases disponibles en el sistema y asigna operarios habilitados.
          </p>
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
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Descripcion</th>
                  <th>Estado</th>
                  <th className="!text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fases.map((fase) => (
                  <tr key={fase.id}>
                    <td>
                      <span className="font-medium text-ink">{fase.codigo}</span>
                    </td>
                    <td>{fase.nombre}</td>
                    <td className="max-w-xs truncate text-text-secondary">
                      {fase.descripcion || '—'}
                    </td>
                    <td>
                      <Toggle
                        checked={fase.activo}
                        onChange={() => handleToggleActivo(fase)}
                        label={fase.activo ? 'Activa' : 'Inactiva'}
                      />
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-6">
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(fase)}
                          className="hover:text-ink"
                          aria-label={`Editar ${fase.nombre}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/config/fases/${fase.id}/operarios`)}
                          className="hover:text-primary"
                          aria-label={`Operarios de ${fase.nombre}`}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
