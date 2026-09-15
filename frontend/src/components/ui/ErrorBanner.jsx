import { RefreshCcw, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

/**
 * Banner de error con mensaje y boton de reintento (spec §7.1).
 * Uso: toast + ErrorBanner con retry ante fallos de carga.
 */
export const ErrorBanner = ({
  message = 'Ocurrio un error al cargar los datos.',
  retryLabel = 'Reintentar',
  onRetry = null,
  className = '',
  ...props
}) => (
  <div
    role="alert"
    className={`flex flex-col gap-3 rounded-xl bg-error-light p-4 text-label text-error ${className}`}
    {...props}
  >
    <p className="flex items-start gap-2">
      <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
    {onRetry && (
      <Button variant="secondary" size="lg" onClick={onRetry} className="w-full">
        <RefreshCcw className="h-5 w-5" aria-hidden="true" />
        {retryLabel}
      </Button>
    )}
  </div>
);
