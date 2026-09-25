import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calculator, Inbox, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorBanner,
  SkeletonTable,
  Title,
} from "../../components/ui";

const estadoSolicitud = {
  PENDIENTE_COTIZACION: {
    variant: "pending",
    label: "Pendiente de cotización",
  },
  COTIZADA: { variant: "quoted", label: "Cotizada" },
};

// Textos por rol.
const TEXTOS_JEFE = {
  subtitulo: "Solicitudes pendientes de cotizar. Elegí una para comenzar.",
  tarjeta: "Pendientes de cotizar",
  vacioTitulo: "Sin solicitudes pendientes de cotizar",
  vacioDescripcion:
    "Cuando el equipo comercial cargue pedidos, aparecerán aquí para cotizar.",
};

export const SolicitudesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { solicitudes, cargando, error, recargar } = useSolicitudes();
  const esJefe = user?.rol === "JEFE_PRODUCCION";
  const esVendedor = user?.rol === "VENDEDOR";
  const estadoParam = searchParams.get("estado");
  const estadoFiltro = estadoParam || (esJefe ? "PENDIENTE_COTIZACION" : "TODOS");

  // La lista puede cambiar fuera de esta pantalla (otro vendedor o el jefe
  // cotizando): se vuelve a pedir cada vez que se entra (FE-4).
  useEffect(() => {
    recargar();
  }, [recargar]);

  // Orden inicial por rol (el header sigue permitiendo reordenar a mano):
  // Jefe: FIFO, la más antigua primero (más tiempo esperando).
  // Vendedor: LIFO, la más reciente primero.
  const solicitudesVisibles = useMemo(() => {
    const timestamp = (item) => {
      const t = Date.parse(item.created_at ?? "");
      return Number.isNaN(t) ? 0 : t;
    };
    const propias = esVendedor
      ? solicitudes.filter((item) => item.vendedor_id == null || Number(item.vendedor_id) === Number(user.id))
      : solicitudes;
    const filtradas = estadoFiltro === "TODOS" ? propias : propias.filter((item) => item.estado === estadoFiltro);
    return filtradas.slice().sort((a, b) => (esJefe ? timestamp(a) - timestamp(b) : timestamp(b) - timestamp(a)) || (esJefe ? a.id - b.id : b.id - a.id));
  }, [solicitudes, esJefe, esVendedor, user, estadoFiltro]);

  const cambiarEstado = (event) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value === "TODOS") next.delete("estado");
    else next.set("estado", value);
    setSearchParams(next);
  };

  const columns = useMemo(() => {
    const base = [
      { accessorKey: "numero_solicitud", header: "Número" },
      { accessorKey: "cliente_razon_social", header: "Cliente" },
      { accessorKey: "descripcion_pieza", header: "Pieza o trabajo" },
      {
        accessorKey: "fecha_esperada_entrega",
        header: "Entrega esperada",
        cell: ({ getValue }) => getValue() || "Sin fecha",
      },
    ];
    // Columna Estado solo si NO es Jefe: para el Jefe es redundante porque
    // la vista ya filtra y comunica "pendientes de cotizar" por todos lados.
    if (!esJefe) {
      base.push({
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => {
          const estado = estadoSolicitud[getValue()] || {
            variant: "queue",
            label: getValue().replace(/_/g, " "),
          };
          return (
            <Badge variant={estado.variant} type="inline">
              {estado.label}
            </Badge>
          );
        },
      });
    }
    // Columna de acción solo para el Jefe (FE-2). El Vendedor no la ve.
    if (esJefe) {
      base.push({
        id: "accion",
        header: "Acción",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/cotizaciones/nueva?solicitud=${row.original.id}`);
            }}
            aria-label={`Cotizar ${row.original.numero_solicitud}`}
          >
            <Calculator className="h-4 w-4" />
            Cotizar
          </Button>
        ),
      });
    }
    return base;
  }, [esJefe, navigate]);

  const subtitulo = esJefe
    ? TEXTOS_JEFE.subtitulo
    : "Consulta y gestioná el estado de todas tus solicitudes de pedido.";
  const tituloTarjeta = esJefe ? TEXTOS_JEFE.tarjeta : "Pedidos registrados";
  const vacioTitulo = esJefe
    ? TEXTOS_JEFE.vacioTitulo
    : "Sin solicitudes pendientes";
  const vacioDescripcion = esJefe
    ? TEXTOS_JEFE.vacioDescripcion
    : "Cuando el equipo comercial cargue pedidos, apareceran aqui.";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Solicitudes</Title>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">Solicitudes</h1>
          <p className="mt-1 text-body text-text-secondary">{subtitulo}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={recargar}
            loading={cargando}
            aria-label="Actualizar solicitudes"
          >
            <RefreshCw
              className={`h-4 w-4 ${cargando ? "hidden" : ""}`}
              aria-hidden={cargando}
            />
            Actualizar
          </Button>
          {esVendedor && (
            <Button onClick={() => navigate("/solicitudes/nueva")}>
              <Plus className="h-4 w-4" />
              Nueva solicitud
            </Button>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{tituloTarjeta}</CardTitle>
        </CardHeader>
        <div className="mb-4 flex justify-end">
          {!esJefe && (
            <select className="select" value={estadoFiltro} onChange={cambiarEstado} aria-label="Filtrar solicitudes por estado">
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE_COTIZACION">Pendiente de cotización</option>
              <option value="COTIZADA">Cotizada</option>
            </select>
          )}
        </div>
        {cargando ? (
          <SkeletonTable columns={5} rows={5} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={recargar} />
        ) : solicitudesVisibles.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={vacioTitulo}
            description={vacioDescripcion}
            action={
              esVendedor ? (
                <Button
                  onClick={() => navigate("/solicitudes/nueva")}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva solicitud
                </Button>
              ) : null
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={solicitudesVisibles}
            searchable
            searchPlaceholder="Buscar por numero o cliente..."
            footer={`${solicitudesVisibles.length} ${solicitudesVisibles.length !== 1 ? "solicitudes" : "solicitud"}`}
          />
        )}
      </Card>
    </div>
  );
};
