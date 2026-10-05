/**
 * Placeholder con pulso que imita una Card mientras cargan los datos.
 * Uso: HU-1.3, HU-2.2, HU-3.1.
 */
export const SkeletonCard = ({ rows = 3, className = '', ...props }) => (
  <div
    role="status"
    aria-label="Cargando contenido..."
    className={`card animate-pulse ${className}`}
    {...props}
  >
    <div className="mb-4 h-5 w-1/3 rounded bg-border" />
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="mb-2.5 h-4 rounded bg-canvas last:mb-0"
        style={{ width: `${100 - index * 12}%` }}
      />
    ))}
    <span className="sr-only">Cargando contenido...</span>
  </div>
);
