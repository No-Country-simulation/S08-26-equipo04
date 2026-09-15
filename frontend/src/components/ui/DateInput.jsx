import { format, isValid, parseISO } from 'date-fns';

export const DateInput = ({ value = '', onChange, min, max, ...props }) => {
  const formattedValue = value && isValid(parseISO(value)) ? format(parseISO(value), 'yyyy-MM-dd') : value;

  return (
    <input
      type="date"
      value={formattedValue}
      min={min}
      max={max}
      onChange={(event) => onChange?.(event.target.value)}
      className="input"
      {...props}
    />
  );
};