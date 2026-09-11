import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button, Field } from './ui';

export const SecuenciaFaseRow = ({
  fase,
  index,
  onActualizar,
  onEliminar,
  errors,
}) => {
  const handleChange = (campo, valor) => {
    onActualizar(index, { ...fase, [campo]: valor });
  };

  return (
    <Draggable draggableId={`fase-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center gap-3 rounded-lg border border-border bg-surface p-4 ${
            snapshot.isDragging ? 'shadow-modal' : ''
          }`}
        >
          <button
            type="button"
            {...provided.dragHandleProps}
            className="shrink-0 text-text-muted hover:text-ink"
            aria-label="Arrastrar para reordenar"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-tint text-caption font-semibold text-primary">
                {index + 1}
              </span>
              <span className="font-medium text-ink">{fase.fase_nombre}</span>
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <Field
                label="Tiempo (min)"
                id={`fase-tiempo-${index}`}
                type="number"
                min="1"
                value={fase.tiempo_estimado_minutos || ''}
                onChange={(e) =>
                  handleChange('tiempo_estimado_minutos', Number(e.target.value))
                }
                error={errors?.tiempo_estimado_minutos?.message}
                className="w-24"
              />

              <Field
                label="Instrucciones"
                id={`fase-instrucciones-${index}`}
                type="text"
                value={fase.instrucciones_fase}
                onChange={(e) =>
                  handleChange('instrucciones_fase', e.target.value)
                }
                placeholder="Instrucciones para esta fase..."
                className="flex-1"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => onEliminar(index)}
            className="shrink-0 text-text-muted hover:text-error"
            aria-label={`Eliminar ${fase.fase_nombre}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Draggable>
  );
};
