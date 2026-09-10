import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mocks } from '../../mocks';
import { Button, Card, CardHeader, CardTitle, Toggle } from '../../components/ui';
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

  if (!fase) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
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
          <p className="text-label text-primary">Configuracion</p>
          <h1 className="mt-1 text-h1 text-ink">
            Operarios habilitados
          </h1>
          <p className="mt-2 text-body text-text-secondary">
            <span className="font-medium text-ink">{fase.nombre}</span> ({fase.codigo})
            {' — '}Selecciona que operarios pueden ejecutar esta fase.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operarios del sistema</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Operario</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Habilitado</th>
              </tr>
            </thead>
            <tbody>
              {operarios.map((operario) => {
                const isHabilitado = asignaciones[operario.id] === true;
                return (
                  <tr key={operario.id}>
                    <td>
                      <span className="font-medium text-ink">{operario.nombre}</span>
                    </td>
                    <td className="text-text-secondary">{operario.email}</td>
                    <td className="text-text-secondary">
                      {operario.tipo_tarea || '—'}
                    </td>
                    <td>
                      <Toggle
                        checked={isHabilitado}
                        onChange={() => handleToggle(operario.id)}
                        label={isHabilitado ? 'Habilitado' : 'No habilitado'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
