import { useState, useMemo } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
  useLegacyTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table/legacy';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

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

  // FE-275: deriva una paginacion "segura" sin setState en efectos.
  // Si `data` se achica y la pagina actual queda fuera de rango, se usa la
  // ultima pagina valida; en cualquier otro caso se conserva pageIndex.
  // (La busqueda si resetea a 0 de forma explicita en su onChange.)
  const rowCount = data?.length ?? 0;
  const safePagination = useMemo(() => {
    const pageCountFromData = Math.max(1, Math.ceil(rowCount / pagination.pageSize));
    if (pagination.pageIndex >= pageCountFromData) {
      return { ...pagination, pageIndex: pageCountFromData - 1 };
    }
    return pagination;
  }, [pagination, rowCount]);

  const table = useLegacyTable({
    data,
    columns: tableColumns,
    state: { globalFilter, sorting, pagination: safePagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    // FE-275: por defecto TanStack resetea pageIndex a 0 cada vez que `data`
    // cambia (p. ej. al activar/desactivar un registro con update optimista),
    // lo que devolvia al usuario a la pagina 1 aunque estuviera en la 2 o 3.
    // Se desactiva y solo se recalcula si la pagina actual quedo vacia.
    autoResetPageIndex: false,
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const currentPage = safePagination.pageIndex;
  const totalRows = data.length;
  const showingFrom = currentPage * safePagination.pageSize + 1;
  const showingTo = Math.min((currentPage + 1) * safePagination.pageSize, totalRows);

  const footerText = footer || (totalRows > 0
    ? `Mostrando ${showingFrom} a ${showingTo} de ${totalRows} registros`
    : 'Sin registros');

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            id="tabla-busqueda"
            name="busqueda"
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
        <div
          className="table-scroll"
          role="region"
          aria-label="Tabla con desplazamiento lateral"
          tabIndex={0}
        >
          <table className={`table ${comfortable ? 'table-comfortable' : ''}`}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={canSort ? 'cursor-pointer select-none' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        canSort
                          ? sorted === 'asc'
                            ? 'Ordenado ascendente. Clic para orden descendente'
                            : sorted === 'desc'
                              ? 'Ordenado descendente. Clic para quitar el orden'
                              : 'Clic para ordenar'
                          : undefined
                      }
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : canSort
                              ? 'none'
                              : undefined
                      }
                    >
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="inline-flex shrink-0" aria-hidden="true">
                            {sorted === 'asc' ? (
                              <ArrowUp className="h-4 w-4 text-text-secondary" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="h-4 w-4 text-text-secondary" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 text-text-muted opacity-40" />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
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
        </div>
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
