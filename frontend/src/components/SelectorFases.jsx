import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from './ui';

export const SelectorFases = ({
  fasesDisponibles,
  onAgregar,
  cargando = false,
  error = null,
  mensajeVacio = 'No hay fases disponibles',
}) => {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
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

  const alternar = () => {
    if (!open) setBusqueda('');
    setOpen((v) => !v);
  };

  const visibles = fasesDisponibles.filter((fase) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    return (
      fase.nombre?.toLowerCase().includes(texto) ||
      fase.codigo?.toLowerCase().includes(texto)
    );
  });

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
        onClick={alternar}
        disabled={cargando}
      >
        <Plus className="h-4 w-4" />
        {cargando ? 'Cargando fases...' : 'Agregar fase'}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute left-0 z-10 mt-1 w-72 rounded-lg border border-border bg-surface shadow-modal">
          {!cargando && !error && fasesDisponibles.length > 0 && (
            <div className="border-b border-border p-2">
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar fase..."
                aria-label="Buscar fase por nombre o codigo"
                className="input"
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto py-1">
            {cargando ? (
              <li className="px-4 py-2 text-metadata text-text-muted">
                Cargando fases...
              </li>
            ) : error ? (
              <li role="alert" className="px-4 py-2 text-metadata text-error">
                {error}
              </li>
            ) : visibles.length === 0 ? (
              <li className="px-4 py-2 text-metadata text-text-muted">
                {busqueda.trim() ? 'Sin coincidencias.' : mensajeVacio}
              </li>
            ) : (
              visibles.map((fase) => (
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
