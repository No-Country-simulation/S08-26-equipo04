import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Inbox, RefreshCw, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCotizaciones } from "../../hooks/useCotizaciones";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorBanner,
  SkeletonTable,
  Title,
} from "../../components/ui";
import { formatDateTime } from "../../api/helpers";

const estadoBadge = {
  LISTA_PARA_ENVIAR: "pending",
  ENVIADA_A_CLIENTE: "quoted",
  APROBADA: "approved",
  NO_APROBADA: "production",
};

const estadoLabels = {
  ENVIADA_A_CLIENTE: "Enviada al cliente",
  APROBADA: "Aprobada",
  NO_APROBADA: "No aprobada",
  LISTA_PARA_ENVIAR: "Lista para enviar",
};

export const CotizacionesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { cotizaciones, cargando, error, recargar } = useCotizaciones();
  // El DTO de cotización no trae solicitud_numero/cliente: se enriquece
  // con la lista de solicitudes (igual que solicitudes hace con clientes).
  const { solicitudes } = useSolicitudes();
  const [busqueda, setBusqueda] = useState("");
  const estado = searchParams.get("estado") || "TODOS";

  // La lista puede cambiar fuera de esta pantalla (el jefe cotiza en otra
  // pestaña): se vuelve a pedir cada vez que se entra (FE-4).
  useEffect(() => {
    recargar();
  }, [recargar]);

  const solicitudPorId = useMemo(
    () => new Map(solicitudes.map((item) => [item.id, item])),
    [solicitudes],
  );

  const filas = useMemo(
    () =>
      cotizaciones.map((cotizacion) => {
        const solicitud = solicitudPorId.get(cotizacion.solicitud_id);
        return {
          ...cotizacion,
          solicitud_numero:
            cotizacion.solicitud_numero ?? solicitud?.numero_solicitud ?? "—",
          cliente_razon_social:
            cotizacion.cliente_razon_social ??
            solicitud?.cliente_razon_social ??
            "—",
          pieza_trabajo:
            cotizacion.descripcion_pieza ??
            cotizacion.pieza_trabajo ??
            solicitud?.descripcion_pieza ??
            null,
        };
      }),
    [cotizaciones, solicitudPorId],
  );

  const cotizacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return filas.filter((c) => {
      const coincideTexto =
        !texto ||
        [
          c.numero_cotizacion,
          c.cliente_razon_social,
          c.solicitud_numero,
          c.pieza_trabajo,
        ].some((v) => v?.toLowerCase().includes(texto));
      const coincideEstado = estado === "TODOS" || c.estado === estado;
      return coincideTexto && coincideEstado;
    });
  }, [filas, busqueda, estado]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_cotizacion",
        header: "Cotización",
        cell: ({ row }) => {
          const cot = row.original;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/cotizaciones/${cot.id}`);
              }}
              className="font-medium text-primary hover:underline"
              aria-label={`Ver ${cot.numero_cotizacion}`}
            >
              {cot.numero_cotizacion}
            </button>
          );
        },
      },
      { accessorKey: "solicitud_numero", header: "Solicitud" },
      { accessorKey: "cliente_razon_social", header: "Cliente" },
      {
        accessorKey: "pieza_trabajo",
        header: "Pieza o trabajo",
        cell: ({ getValue }) => getValue() || "Trabajo metalúrgico",
      },
      {
        accessorKey: "precio_final",
        header: "Precio",
        cell: ({ getValue }) => {
          const valor = getValue();
          return valor == null
            ? "—"
            : `$${Number(valor).toLocaleString("es-AR")}`;
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => (
          <Badge variant={estadoBadge[getValue()] || "pending"} type="inline">
            {estadoLabels[getValue()] || getValue().replace(/_/g, " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "Actualizada",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatDateTime(getValue())}
          </span>
        ),
      },
    ],
    [navigate],
  );

  const handleRowClick = (row) => {
    navigate(`/cotizaciones/${row.id}`);
  };

  const cambiarEstado = (event) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value === "TODOS") next.delete("estado");
    else next.set("estado", value);
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-[1360px] space-y-8">
      <Title>Cotizaciones</Title>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">Cotizaciones</h1>
          {user?.rol === "VENDEDOR" ? (
            <p className="mt-1 text-body text-text-secondary">
              Revisa las cotizaciones y registra la respuesta del cliente.
            </p>
          ) : (
            <p className="mt-1 text-body text-text-secondary">
              Cotizaciones listas para enviar al cliente.
            </p>
          )}
        </div>
        {/* FE-154: sin botón "Nueva cotización". Se cotiza desde
            Solicitudes con el botón "Cotizar" de cada fila. */}
        <Button
          variant="secondary"
          onClick={recargar}
          loading={cargando}
          aria-label="Actualizar cotizaciones"
        >
          <RefreshCw
            className={`h-4 w-4 ${cargando ? "hidden" : ""}`}
            aria-hidden={cargando}
          />
          Actualizar
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1" htmlFor="cotizaciones-busqueda">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            id="cotizaciones-busqueda"
            name="busqueda"
            className="input h-11 pl-10 text-body"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cotización, cliente o pieza"
            aria-label="Buscar cotizaciones"
          />
        </label>
        <select
          id="cotizaciones-estado"
          name="estado"
          className="select h-11 sm:w-[220px] sm:max-w-none text-body"
          value={estado}
          onChange={cambiarEstado}
          aria-label="Filtrar por estado"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="ENVIADA_A_CLIENTE">Enviada al cliente</option>
          <option value="APROBADA">Aprobada</option>
          <option value="NO_APROBADA">No aprobada</option>
          <option value="LISTA_PARA_ENVIAR">Lista para enviar</option>
        </select>
      </div>

      <Card className="p-0">
        {cargando ? (
          <SkeletonTable columns={7} rows={5} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={recargar} />
        ) : cotizacionesFiltradas.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin cotizaciones"
            description="Cuando producción cotice solicitudes, aparecerán aquí."
          />
        ) : (
          <DataTable
            columns={columns}
            data={cotizacionesFiltradas}
            onRowClick={handleRowClick}
            comfortable
            footer={`${cotizacionesFiltradas.length} cotización${cotizacionesFiltradas.length !== 1 ? "es" : ""}`}
          />
        )}
      </Card>
    </div>
  );
};
