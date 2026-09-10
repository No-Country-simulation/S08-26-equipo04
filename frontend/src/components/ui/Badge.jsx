
export const Badge = ({ variant = 'pending', children, className = '', ...props }) => {
  // Variantes esperadas: pending, quoted, approved, production, quality, completed, queue
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
};