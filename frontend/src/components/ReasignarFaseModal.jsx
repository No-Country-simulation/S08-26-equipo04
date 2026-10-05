import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiGet, apiPost } from '../api';
import { Button, Modal } from './ui';

/**
 * Modal de reasignación de fase (Jefe de Producción).
 *
 * Extraído de GestionPlantaPage para reutilizarlo en el Expediente
 * (FE-274): misma lógica, mismos mensajes.
 *
 * `fase` debe traer id + ids de catálogo/operario
 * (`faseCatalogoId`/`fase_catalogo_id`, `operarioId`/`operario_id`).
 * `nombreOperarioActual` es solo display (el expediente trae el nombre,
 * no el id).
 *
 * Los padres lo montan con `key={fase?.id}` para que operario/motivo
 * arranquen vacíos en cada apertura.
 */
export const ReasignarFaseModal = ({
  fase,
  open,
  nombreOperarioActual = null,
  onClose,
  onReasignada,
}) => {
  const [operarioDestinoId, setOperarioDestinoId] = useState('');
  const [motivo, setMotivo] = useState('');
  // Habilitados de la fase en edición: son los destinos posibles (incluye
  // operarios sin carga). Claveado por fase como las notas del detalle.
  const [destinosState, setDestinosState] = useState({
    faseId: null,
    catalogoId: null,
    lista: [],
  });

  const faseId = fase?.id ?? null;
  const catalogoId = fase?.faseCatalogoId ?? fase?.fase_catalogo_id ?? null;
  const esDeEstaFase =
    destinosState.faseId === faseId &&
    destinosState.catalogoId === catalogoId;
  const destinos = esDeEstaFase ? destinosState.lista : [];
  const cargandoDestinos =
    open && faseId != null && catalogoId != null && !esDeEstaFase;

  useEffect(() => {
    if (!open || faseId == null || catalogoId == null) return undefined;
    let cancelado = false;
    apiGet(`/api/fases/${catalogoId}/operarios`).then(
      ({ data }) => {
        if (cancelado) return;
        setDestinosState({ faseId, catalogoId, lista: data ?? [] });
      },
      () => {
        if (cancelado) return;
        setDestinosState({ faseId, catalogoId, lista: [] });
      },
    );
    return () => {
      cancelado = true;
    };
  }, [open, faseId, catalogoId]);

  const handleReasignar = async () => {
    if (!fase || !operarioDestinoId || !motivo.trim()) return;

    const operarioActualId = fase.operarioId ?? fase.operario_id;
    if (Number(operarioDestinoId) === Number(operarioActualId)) {
      toast.warning('Elegí un operario distinto al actual.');
      return;
    }

    try {
      await apiPost(`/api/ot-fases/${fase.id}/reasignar`, {
        operario_nuevo_id: Number(operarioDestinoId),
        motivo: motivo.trim(),
      });
      toast.success('Fase reasignada correctamente.');
      onReasignada?.(fase, Number(operarioDestinoId));
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.mensaje ??
          err?.response?.data?.message ??
          err?.response?.data?.error ??
          'No se pudo reasignar la fase.',
      );
    }
  };

  const otrosHabilitados = (destinos ?? []).filter(
    (operario) =>
      operario.id !== (fase?.operarioId ?? fase?.operario_id),
  );

  return (
    <Modal open={open} onClose={onClose} title="Reasignar fase">
      {fase && (
        <div className="space-y-4">
          <div className="rounded-lg bg-canvas p-3">
            <p className="text-label text-ink">
              {fase.ot_numero ?? fase.numero_ot ?? '—'}
            </p>
            <p className="text-body text-text-secondary">
              {fase.fase_nombre ?? fase.faseNombre ?? 'Fase'} · actual:{' '}
              {nombreOperarioActual ?? '—'}
            </p>
          </div>

          {!cargandoDestinos && otrosHabilitados.length === 0 ? (
            <p className="text-body text-text-secondary">
              No hay otro operario habilitado para esta fase.
            </p>
          ) : (
            <label className="block space-y-1.5" htmlFor="operario-destino">
              <span className="text-label text-ink">Nuevo operario</span>
              <select
                id="operario-destino"
                name="operario_destino_id"
                className="select"
                value={operarioDestinoId}
                disabled={cargandoDestinos}
                onChange={(event) =>
                  setOperarioDestinoId(event.target.value)
                }
              >
                <option value="">
                  {cargandoDestinos
                    ? 'Cargando habilitados...'
                    : 'Elegí un operario'}
                </option>
                {otrosHabilitados.map((operario) => (
                  <option key={operario.id} value={operario.id}>
                    {operario.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block space-y-1.5" htmlFor="motivo-reasignacion">
            <span className="text-label text-ink">Motivo</span>
            <input
              id="motivo-reasignacion"
              name="motivo"
              className="input"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Indica el motivo de la reasignación"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleReasignar}
              disabled={!operarioDestinoId || !motivo.trim()}
            >
              Confirmar reasignación
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
