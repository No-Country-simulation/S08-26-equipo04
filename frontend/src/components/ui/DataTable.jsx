import { useState, useMemo } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
  useLegacyTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table/legacy';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTable = ({
  columns,
  data,
  footer,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  pageSize = 10,
  initialSorting = [],
  comfortable = false,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState(initialSorting);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const tableColumns = useMemo(() => columns, [columns]);

  const table = useLegacyTable({
    data,
    columns: tableColumns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const currentPage = pagination.pageIndex;
  const totalRows = data.length;
  const showingFrom = currentPage * pagination.pageSize + 1;
  const showingTo = Math.min((currentPage + 1) * pagination.pageSize, totalRows);

  const footerText = footer || (totalRows > 0
    ? `Mostrando ${showingFrom} a ${showingTo} de ${totalRows} registros`
    : 'Sin registros');

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            placeholder={searchPlaceholder}
            className="input pl-10"
          />
        </div>
      )}

      <div className="table-container">
        <table className={`table ${comfortable ? 'table-comfortable' : ''}`}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' \u2191', desc: ' \u2193' }[header.column.getIsSorted()] ?? ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="py-8 text-center text-text-muted">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="table-footer flex items-center justify-between">
          <span>{footerText}</span>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded p-1 text-text-muted hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-metadata text-text-secondary">
                Página {currentPage + 1} de {pageCount}
              </span>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded p-1 text-text-muted hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
