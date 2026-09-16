import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from './ui';

export const SelectorFases = ({ fasesDisponibles, onAgregar }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeleccionar = (fase) => {
    onAgregar({
      fase_catalogo_id: fase.id,
      fase_nombre: fase.nombre,
      tiempo_estimado_minutos: 0,
      instrucciones_fase: '',
    });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(!open)}
      >
        <Plus className="h-4 w-4" />
        Agregar fase
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute left-0 z-10 mt-1 w-64 rounded-lg border border-border bg-surface shadow-modal">
          <ul className="max-h-60 overflow-y-auto py-1">
            {fasesDisponibles.length === 0 ? (
              <li className="px-4 py-2 text-metadata text-text-muted">
                No hay fases disponibles
              </li>
            ) : (
              fasesDisponibles.map((fase) => (
                <li key={fase.id}>
                  <button
                    type="button"
                    onClick={() => handleSeleccionar(fase)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-body text-ink hover:bg-primary-tint"
                  >
                    <span className="font-medium">{fase.nombre}</span>
                    <span className="text-metadata text-text-muted">{fase.codigo}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
