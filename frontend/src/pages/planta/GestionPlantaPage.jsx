import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Clock3, Users } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost } from '../../api';
import { Badge, Button, Card, CardHeader, CardTitle, ErrorBanner, LoadingSpinner, Modal, Title } from '../../components/ui';

const estadoVariant = {
  EN_EJECUCION: 'production',
  EN_COLA: 'queue',
  TERMINADO: 'completed',
  NO_CONFORME: 'quality',
};

const estadoLabel = {
  EN_EJECUCION: 'En ejecución',
  EN_COLA: 'En cola',
  TERMINADO: 'Terminado',
  NO_CONFORME: 'No conforme',
};

export const GestionPlantaPage = () => {
  const [faseActual, setFaseActual] = useState(null);
  const [operarioDestinoId, setOperarioDestinoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [otFases, setOtFases] = useState([]);
  const [fasesCatalogo, setFasesCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([apiGet('/api/ot-fases'), apiGet('/api/fases')]).then(([fasesResponse, catalogoResponse]) => {
      if (cancelado) return;
      setOtFases(fasesResponse.data ?? []);
      setFasesCatalogo(catalogoResponse.data ?? []);
      setCargando(false);
    }).catch((err) => {
      if (cancelado) return;
      setError(err?.response?.data?.message || err?.response?.data?.error || 'No se pudo cargar la gestión de planta.');
      setCargando(false);
    });
    return () => { cancelado = true; };
  }, []);

  const operarios = useMemo(() => {
    const ids = [...new Set(otFases.map((fase) => fase.operarioId ?? fase.operario_id).filter(Boolean))];
    return ids.map((id) => ({ id, nombre: `Operario #${id}` }));
  }, [otFases]);

  const fasesNormalizadas = useMemo(() => otFases.map((fase) => ({
    ...fase,
    operario_id: fase.operarioId ?? fase.operario_id,
    fase_nombre: fase.fase_nombre ?? fasesCatalogo.find((item) => item.id === (fase.faseCatalogoId ?? fase.fase_catalogo_id))?.nombre ?? `Fase #${fase.faseCatalogoId ?? fase.fase_catalogo_id}`,
    ot_numero: fase.ot_numero ?? `OT #${fase.ordenTrabajoId ?? fase.orden_trabajo_id}`,
  })), [fasesCatalogo, otFases]);

  const cargaPorOperario = useMemo(() => {
    const grupos = new Map(
      operarios.map((operario) => [
        operario.id,
        {
          ...operario,
          fases: [],
          total: 0,
        },
      ]),
    );

    fasesNormalizadas.forEach((fase) => {
      const grupo = grupos.get(fase.operarioId ?? fase.operario_id);
      if (!grupo) return;
      grupo.fases.push(fase);
      grupo.total += 1;
    });

    return Array.from(grupos.values()).filter((grupo) => grupo.fases.length > 0);
  }, [fasesNormalizadas, operarios]);

  const totalPendientes = fasesNormalizadas.filter((fase) => fase.estado !== 'TERMINADO').length;

  const openReasignacion = (fase) => {
    setFaseActual(fase);
    setOperarioDestinoId(String(fase.operarioId ?? fase.operario_id));
    setMotivo('');
  };

  const handleReasignar = async () => {
    if (!faseActual || !operarioDestinoId || !motivo.trim()) return;

    const operarioActualId = faseActual.operarioId ?? faseActual.operario_id;
    if (Number(operarioDestinoId) === Number(operarioActualId)) {
      setFaseActual(null);
      setOperarioDestinoId('');
      return;
    }

    try {
      await apiPost(`/api/ot-fases/${faseActual.id}/reasignar`, {
        operarioNuevoId: Number(operarioDestinoId),
        motivo: motivo.trim(),
      });
      setOtFases((prev) => prev.map((fase) => fase.id === faseActual.id
        ? { ...fase, operarioId: Number(operarioDestinoId), operario_id: Number(operarioDestinoId) }
        : fase));
      toast.success('Fase reasignada correctamente.');
      setFaseActual(null);
      setOperarioDestinoId('');
      setMotivo('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || 'No se pudo reasignar la fase.');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Gestión de planta</Title>

      {cargando && <LoadingSpinner label="Cargando fases de planta" />}
      {error && <ErrorBanner message={error} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label text-primary">Producción</p>
          <h1 className="mt-1 text-h1 text-ink">Gestión de planta</h1>
          <p className="mt-2 text-body text-text-secondary">
            Monitoreá la carga de trabajo por operario y reasigná fases para equilibrar la producción.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-4">
          <span className="rounded-lg bg-primary-tint p-3 text-primary">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-metadata text-text-muted">Operarios activos</p>
            <p className="text-2xl font-semibold text-ink">{operarios.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="rounded-lg bg-primary-tint p-3 text-primary">
            <ArrowRightLeft className="h-5 w-5" />
          </span>
          <div>
            <p className="text-metadata text-text-muted">Fases pendientes</p>
            <p className="text-2xl font-semibold text-ink">{totalPendientes}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <span className="rounded-lg bg-primary-tint p-3 text-primary">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-metadata text-text-muted">OTs en curso</p>
            <p className="text-2xl font-semibold text-ink">{new Set(fasesNormalizadas.map((fase) => fase.ot_numero)).size}</p>
          </div>
        </Card>
      </div>

      {!cargando && !error && cargaPorOperario.length === 0 ? (
        <Card>
          <p className="text-body text-text-secondary">No hay operarios activos con carga asignada.</p>
        </Card>
      ) : !cargando && !error ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {cargaPorOperario.map((operario) => (
            <Card key={operario.id} className="space-y-4">
              <CardHeader className="mb-0 flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{operario.nombre}</CardTitle>
                  <p className="mt-1 text-metadata text-text-muted">{operario.tipo_tarea || 'Sin especialidad definida'}</p>
                </div>
                <Badge variant="production" type="badge">
                  {operario.total} fase{operario.total !== 1 ? 's' : ''}
                </Badge>
              </CardHeader>

              <div className="space-y-3">
                {operario.fases.map((fase) => (
                  <div key={fase.id} className="rounded-lg border border-border bg-canvas p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-label text-ink">{fase.ot_numero}</p>
                        <p className="text-body text-text-secondary">{fase.fase_nombre}</p>
                      </div>
                      <Badge variant={estadoVariant[fase.estado] || 'queue'} type="inline">
                        {estadoLabel[fase.estado] || fase.estado}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-metadata text-text-muted">
                      <span>Vencimiento: {formatDate(fase.fecha_vencimiento)}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openReasignacion(fase)}
                      >
                        Reasignar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Modal
        open={Boolean(faseActual)}
        onClose={() => {
          setFaseActual(null);
          setOperarioDestinoId('');
        }}
        title="Reasignar fase"
      >
        {faseActual && (
          <div className="space-y-4">
            <div className="rounded-lg bg-canvas p-3">
              <p className="text-label text-ink">{faseActual.ot_numero}</p>
              <p className="text-body text-text-secondary">
                {faseActual.fase_nombre} · actual: {faseActual.operario_nombre}
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-label text-ink">Nuevo operario</span>
              <select
                className="select"
                value={operarioDestinoId}
                onChange={(event) => setOperarioDestinoId(event.target.value)}
              >
                {operarios
                  .filter((operario) => operario.id !== faseActual.operario_id)
                  .map((operario) => (
                    <option key={operario.id} value={operario.id}>
                      {operario.nombre}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-label text-ink">Motivo</span>
              <input
                className="input"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Indica el motivo de la reasignación"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setFaseActual(null);
                  setOperarioDestinoId('');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleReasignar} disabled={!operarioDestinoId || !motivo.trim()}>
                Confirmar reasignación
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
