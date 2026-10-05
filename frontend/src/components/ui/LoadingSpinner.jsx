import { Loader2 } from 'lucide-react';

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

/**
 * Spinner para estados de carga (spec §7.1: "Spinner centrado").
 * Por defecto ocupa el area disponible y centra el indicador.
 */
export const LoadingSpinner = ({
  label = 'Cargando...',
  size = 'md',
  className = '',
  ...props
}) => (
  <div
    role="status"
    aria-label={label}
    className={`flex min-h-[40vh] items-center justify-center ${className}`}
    {...props}
  >
    <Loader2
      className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-primary`}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </div>
);
