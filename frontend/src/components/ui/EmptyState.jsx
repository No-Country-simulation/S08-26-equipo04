import { Inbox } from 'lucide-react';

/**
 * Mensaje de estado vacio con icono, titulo, descripcion y accion opcional.
 * Uso: "No hay tareas asignadas", "No hay cotizaciones pendientes", etc.
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description = '',
  action = null,
  className = '',
  ...props
}) => (
  <div
    className={`flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl bg-surface p-8 text-center shadow-card ${className}`}
    {...props}
  >
    <Icon className="h-10 w-10 text-text-muted" aria-hidden="true" />
    <p className="text-h2 text-ink">{title}</p>
    {description && <p className="text-body text-text-secondary">{description}</p>}
    {action}
  </div>
);
