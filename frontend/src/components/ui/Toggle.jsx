export const Toggle = ({ checked, onChange, label, disabled = false, ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    {...props}
  >
    <span
      aria-hidden="true"
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        checked ? 'border-success bg-success' : 'border-border bg-surface hover:bg-canvas'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1 border border-border'
        }`}
      />
    </span>
    {label && (
      <span className={`text-label ${checked ? 'text-success' : 'text-text-muted'}`}>{label}</span>
    )}
  </button>
);