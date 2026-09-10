import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  discrete: 'btn-discrete',
  destructive: 'btn-destructive',
  ghost: 'rounded-lg px-2 py-2 text-text-muted hover:bg-canvas transition-colors',
};

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: '',
  lg: 'text-base px-5 py-3',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-1.5 ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || ''} ${className}`}
    disabled={disabled || loading}
    aria-busy={loading}
    {...props}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
    {children}
  </button>
);