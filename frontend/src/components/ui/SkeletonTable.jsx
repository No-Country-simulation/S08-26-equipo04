/**
 * Placeholder con pulso que imita una tabla (DataTable) mientras cargan los datos.
 * Uso: HU-5.1, HU-1.2.
 */
export const SkeletonTable = ({
  columns = 4,
  rows = 5,
  className = '',
  ...props
}) => (
  <div
    role="status"
    aria-label="Cargando tabla..."
    className={`table-container animate-pulse ${className}`}
    {...props}
  >
    <table className="table" aria-hidden="true">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <div className="h-4 w-3/4 rounded bg-border" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex}>
                <div
                  className="h-4 rounded bg-canvas"
                  style={{ width: colIndex === 0 ? '60%' : '90%' }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <span className="sr-only">Cargando tabla...</span>
  </div>
);
