import { BarChart3 } from 'lucide-react';

/**
 * Placeholder con pulso que imita un grafico mientras cargan las metricas.
 * Uso: HU-5.3, HU-5.4.
 */
const barHeights = ['40%', '65%', '50%', '80%', '58%', '72%', '46%'];

export const SkeletonChart = ({ title = '', className = '', ...props }) => (
  <div
    role="status"
    aria-label={title ? `Cargando grafico: ${title}` : 'Cargando grafico...'}
    className={`card ${className}`}
    {...props}
  >
    {title && (
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-text-muted" aria-hidden="true" />
        <p className="text-h2 text-text-secondary">{title}</p>
      </div>
    )}
    <div className="flex h-40 animate-pulse items-end gap-2 sm:h-48" aria-hidden="true">
      {barHeights.map((height, index) => (
        <div
          key={index}
          className="flex-1 rounded-t-lg bg-canvas"
          style={{ height }}
        />
      ))}
    </div>
    <span className="sr-only">Cargando grafico...</span>
  </div>
);
