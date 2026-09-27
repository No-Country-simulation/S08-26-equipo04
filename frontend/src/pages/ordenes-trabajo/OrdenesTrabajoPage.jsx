import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  ErrorBanner,
  SkeletonTable,
} from "../../components/ui";
import { formatDate } from "../../api/helpers";
import { useOrdenesTrabajo } from "../../hooks/useOrdenesTrabajo";

const estadoLabel = {
  EN_PRODUCCION: "En producción",
  EN_CALIDAD: "En calidad",
  NO_CONFORME: "No conforme",
  DESPACHO: "Lista para entregar",
  ENTREGADA: "Entregada",
};

const estadoVariant = {
  EN_PRODUCCION: "production",
  EN_CALIDAD: "quality",
  NO_CONFORME: "quality",
  DESPACHO: "pending",
  ENTREGADA: "approved",
};

export const OrdenesTrabajoPage = () => {
  const { ordenesTrabajo, cargando, error, recargar } = useOrdenesTrabajo();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroEstado = searchParams.get("estado") || "todos";
  const [busqueda, setBusqueda] = useState("");

  const filasVisibles = useMemo(() => {
    const porEstado = ordenesTrabajo.filter((ot) => {
      const coincideEstado =
        filtroEstado === "todos" || ot.estado === filtroEstado;
      return coincideEstado;
    });
    const texto = busqueda.trim().toLowerCase();
    return texto
      ? porEstado.filter((ot) =>
          [ot.numero_ot, ot.cliente_razon_social, ot.descripcion_pieza].some(
            (value) => value?.toLowerCase().includes(texto),
          ),
        )
      : porEstado;
  }, [filtroEstado, ordenesTrabajo, busqueda]);

  const cambiarEstado = (event) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value === "todos") next.delete("estado");
    else next.set("estado", value);
    setSearchParams(next);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_ot",
        header: "Orden de trabajo",
        cell: ({ row }) => (
          <Link
            to={`/ordenes-trabajo/${row.original.numero_ot}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.numero_ot}
          </Link>
        ),
      },
      { accessorKey: "cliente_razon_social", header: "Cliente" },
      { accessorKey: "descripcion_pieza", header: "Pieza o trabajo" },
      { accessorKey: "cantidad", header: "Cantidad" },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => {
          const estado = getValue();
          return (
            <Badge variant={estadoVariant[estado] || "pending"} type="inline">
              {estadoLabel[estado] || estado}
            </Badge>
          );
        },
      },
      {
        accessorKey: "fecha_esperada_entrega",
        header: "Entrega solicitada",
        cell: ({ getValue }) => formatDate(getValue()),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-[1360px] space-y-6">
      <h1 className="text-h1 text-ink">Órdenes de trabajo</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1" htmlFor="ot-busqueda">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            id="ot-busqueda"
            name="busqueda"
            type="search"
            className="input h-11 w-full pl-10 text-body"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por OT, cliente o pieza"
            aria-label="Buscar por OT, cliente o pieza"
          />
        </label>
        <select
          id="ot-estado"
          name="estado"
          value={filtroEstado}
          onChange={cambiarEstado}
          aria-label="Filtrar por estado"
          className="select h-11 sm:w-[220px] sm:max-w-none text-body"
        >
          <option value="todos">Todos los estados</option>
          <option value="EN_PRODUCCION">En producción</option>
          <option value="EN_CALIDAD">En calidad</option>
          <option value="NO_CONFORME">No conforme</option>
          <option value="DESPACHO">Lista para entregar</option>
          <option value="ENTREGADA">Entregada</option>
        </select>
      </div>

      <Card>
        {cargando ? (
          <SkeletonTable columns={6} rows={5} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={recargar} />
        ) : filasVisibles.length === 0 ? (
          <EmptyState
            title="No hay órdenes de trabajo"
            description="Las órdenes aparecerán cuando una solicitud aprobada genere una orden de trabajo."
          />
        ) : (
          <DataTable
            columns={columns}
            data={filasVisibles}
            initialSorting={[{ id: "fecha_esperada_entrega", desc: false }]}
            footer={`${filasVisibles.length} ${filasVisibles.length === 1 ? "orden" : "órdenes"}`}
          />
        )}
      </Card>
    </div>
  );
};
