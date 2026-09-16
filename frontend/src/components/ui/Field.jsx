export const Field = ({
  label,
  id,
  placeholder,
  helperText,
  error,
  className = '',
  required = false,
  ...props
}) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label htmlFor={id} className="block text-label text-ink">
      {label}{required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
    </label>}
    <input
      id={id}
      placeholder={placeholder}
      required={required}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
      className={`input ${error ? 'border-error focus:ring-error' : ''}`}
      {...props}
    />
    {error && <p id={`${id}-error`} className="text-metadata text-error">{error}</p>}
    {!error && helperText && <p id={`${id}-help`} className="text-metadata text-text-muted">{helperText}</p>}
  </div>
);