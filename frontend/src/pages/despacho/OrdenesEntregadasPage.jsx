import { useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";
import { useOrdenesTrabajo } from "../../hooks/useOrdenesTrabajo";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  ErrorBanner,
  SkeletonTable,
  Title,
} from "../../components/ui";
import { formatDate, formatDateTime } from "../../api/helpers";

/**
 * Vista de solo lectura del historial de OTs entregadas.
 * Accesible para VENDEDOR y JEFE_PRODUCCION.
 * No incluye ninguna acción de entrega (RBAC - issue #157).
 */
export const OrdenesEntregadasPage = () => {
  const { ordenesTrabajo, cargando, error, recargar } = useOrdenesTrabajo();
  const [busqueda, setBusqueda] = useState("");

  const ordenesEntregadas = useMemo(
    () => ordenesTrabajo.filter((ot) => ot.estado === "ENTREGADA"),
    [ordenesTrabajo],
  );

  const ordenesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return ordenesEntregadas;
    return ordenesEntregadas.filter((ot) =>
      [
        ot.numero_ot,
        ot.cliente_razon_social,
        ot.descripcion_pieza,
        ot.receptor_nombre,
      ].some((value) => value?.toLowerCase().includes(texto)),
    );
  }, [ordenesEntregadas, busqueda]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_ot",
        header: "Orden de trabajo",
        cell: ({ getValue }) => (
          <span className="font-medium text-ink">{getValue()}</span>
        ),
      },
      {
        accessorKey: "cliente_razon_social",
        header: "Cliente",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "descripcion_pieza",
        header: "Pieza o trabajo",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "fecha_entrega",
        header: "Fecha de entrega",
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? formatDateTime(value) : "—";
        },
      },
      {
        accessorKey: "receptor_nombre",
        header: "Recibida por",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "fecha_esperada_entrega",
        header: "Entrega solicitada",
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: () => (
          <Badge variant="approved" type="inline">
            Entregada
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Órdenes entregadas</Title>

      <div>
        <h1 className="text-h1 text-ink">Órdenes entregadas</h1>
        <p className="mt-1 text-body text-text-secondary">
          Historial de órdenes de trabajo entregadas (solo lectura).
        </p>
      </div>

      <div className="max-w-xl">
        <input
          id="entregadas-busqueda"
          name="busqueda"
          type="search"
          className="input w-full"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por OT, cliente, pieza o receptor"
          aria-label="Buscar por OT, cliente, pieza o receptor"
        />
      </div>

      <Card>
        {cargando ? (
          <SkeletonTable columns={8} rows={5} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={recargar} />
        ) : ordenesFiltradas.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="No hay OTs entregadas"
            description="Cuando el vendedor registre entregas, aparecerán aquí para consulta."
          />
        ) : (
          <DataTable
            columns={columns}
            data={ordenesFiltradas}
            footer={`${ordenesFiltradas.length} ${
              ordenesFiltradas.length === 1
                ? "orden entregada"
                : "órdenes entregadas"
            }`}
          />
        )}
      </Card>
    </div>
  );
};
