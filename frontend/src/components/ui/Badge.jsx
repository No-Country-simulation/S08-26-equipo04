
export const Badge = ({ variant = 'pending', type = 'badge', children, className = '', ...props }) => {
  // type: 'badge' (fondo coloreado) o 'inline' (punto sin fondo, para tablas)
  // Variantes: pending, quoted, approved, production, quality, completed, queue
  const baseClass = type === 'inline' ? 'badge-inline' : 'badge';
  return (
    <span className={`${baseClass} badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
};