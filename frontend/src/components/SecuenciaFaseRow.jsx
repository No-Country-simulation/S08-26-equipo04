import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button, Field } from './ui';

export const SecuenciaFaseRow = ({
  fase,
  index,
  onActualizar,
  onEliminar,
  errors,
  disabled = false,
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
          className={`flex items-start gap-3 rounded-lg border border-border bg-surface p-4 ${
            snapshot.isDragging ? 'shadow-modal' : ''
          }`}
        >
          <button
            type="button"
            {...provided.dragHandleProps}
            className={`mt-7 shrink-0 ${disabled ? 'cursor-not-allowed text-text-muted/40' : 'text-text-muted hover:text-ink'}`}
            aria-label="Arrastrar para reordenar"
            disabled={disabled}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Grilla con anchos fijos: el nombre se adapta (trunca) y Tiempo
              e Instrucciones arrancan siempre en la misma x en todas las
              filas. En mobile se apila. */}
          <div className="grid min-w-0 flex-1 grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1.2fr)_110px_minmax(0,2fr)]">
            <div className="flex min-w-0 items-center gap-2 sm:pt-7">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-tint text-caption font-semibold text-primary">
                {index + 1}
              </span>
              <span className="min-w-0 truncate font-medium text-ink" title={fase.fase_nombre}>
                {fase.fase_nombre}
              </span>
            </div>

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
              className="w-full sm:w-[110px] sm:shrink-0"
              disabled={disabled}
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
              className="min-w-0"
              disabled={disabled}
            />
          </div>

          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onEliminar(index)}
              className="mt-7 shrink-0 text-text-muted hover:text-error"
              aria-label={`Eliminar ${fase.fase_nombre}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Draggable>
  );
};
