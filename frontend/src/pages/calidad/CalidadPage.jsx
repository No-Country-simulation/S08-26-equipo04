import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, RefreshCcw, Search, ShieldCheck } from "lucide-react";
import { useAuditorias } from "../../hooks/useAuditorias";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  LoadingSpinner,
  Title,
} from "../../components/ui";
import { formatDate, formatDateTime } from "../../api/helpers";

/**
 * Panel de control de calidad con formato planta (mobile-first, igual
 * que Mis tareas del operario): columna angosta, tarjetas apiladas y
 * acciones táctiles grandes. Sin DataTable: en planta se audita de a
 * una OT con el botón Auditar.
 */
const OrdenCardMobile = ({ orden, onAuditar }) => (
  <Card
    className="w-full p-4 sm:p-5"
    data-testid={`calidad-card-${orden.id}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-metadata text-text-muted">{orden.numero_ot}</p>
        <h3 className="truncate text-h2 text-ink">
          {orden.descripcion_pieza || "Trabajo metalúrgico"}
        </h3>
        <p className="mt-0.5 text-label text-text-secondary">
          {orden.cliente_razon_social || "—"}
          {orden.cantidad ? ` · ${orden.cantidad} piezas` : ""}
        </p>
      </div>
      <Badge variant="quality" className="shrink-0 whitespace-nowrap">
        En control
      </Badge>
    </div>

    <dl className="mt-3 space-y-1 text-label text-text-secondary">
      <div className="flex justify-between gap-3">
        <dt>En cola desde</dt>
        <dd className="whitespace-nowrap tabular-nums text-ink">
          {orden.updated_at ? formatDateTime(orden.updated_at) : "—"}
        </dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt>Entrega solicitada</dt>
        <dd className="whitespace-nowrap tabular-nums text-ink">
          {formatDate(orden.fecha_esperada_entrega)}
        </dd>
      </div>
    </dl>

    <div className="mt-4">
      <Button
        size="lg"
        onClick={() => onAuditar(orden)}
        className="min-h-[56px] w-full text-base font-semibold"
        aria-label={`Auditar ${orden.numero_ot}`}
      >
        <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
        Auditar
      </Button>
    </div>
  </Card>
);

export const CalidadPage = () => {
  const navigate = useNavigate();
  const { ordenesTrabajo, cargando, error, recargar } = useAuditorias();

  const [busqueda, setBusqueda] = useState("");

  // HU-4.1: solo OTs que completaron todas sus fases, ordenadas por
  // antigüedad en la cola. El backend pasa la OT a EN_CALIDAD cuando el
  // operario de la última fase marca "terminar", y ese cambio actualiza
  // updated_at: ordenar por updated_at ascendente equivale a la cola.
  const ordenesEnCalidad = useMemo(
    () =>
      ordenesTrabajo
        .filter((ot) => ot.estado === "EN_CALIDAD")
        .sort((a, b) =>
          String(a.updated_at ?? "").localeCompare(
            String(b.updated_at ?? ""),
          ),
        ),
    [ordenesTrabajo],
  );

  const ordenesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return ordenesEnCalidad;
    }

    return ordenesEnCalidad.filter((ot) =>
      [ot.numero_ot, ot.cliente_razon_social, ot.descripcion_pieza].some(
        (value) => value?.toLowerCase().includes(texto),
      ),
    );
  }, [ordenesEnCalidad, busqueda]);

  return (
    <div className="space-y-4 py-2">
      <Title>Control de calidad</Title>
      <header>
        <h1 className="text-h1 text-ink">Control de calidad</h1>
        <p className="mt-1 text-body text-text-secondary">
          Órdenes terminadas pendientes de auditoría, en orden de llegada.
        </p>
      </header>

      <label
        className="relative block"
        htmlFor="calidad-busqueda"
      >
        <Search
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          id="calidad-busqueda"
          name="busqueda"
          type="search"
          className="input min-h-[56px] w-full pl-10 text-base"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por OT, cliente o pieza"
          aria-label="Buscar por OT, cliente o pieza"
        />
      </label>

      {error && !cargando && (
        <ErrorBanner message={error} onRetry={recargar} />
      )}

      {cargando ? (
        <LoadingSpinner label="Cargando órdenes" size="lg" />
      ) : ordenesFiltradas.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No hay OTs pendientes de control"
          description="Cuando los operarios terminen la última fase, las órdenes aparecerán aquí para auditar."
          action={
            <Button
              variant="secondary"
              size="lg"
              onClick={recargar}
              className="mt-2 min-h-[56px] w-full"
            >
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              Actualizar
            </Button>
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4">
            {ordenesFiltradas.map((orden) => (
              <li key={orden.id}>
                <OrdenCardMobile
                  orden={orden}
                  onAuditar={(item) => navigate(`/calidad/${item.id}`)}
                />
              </li>
            ))}
          </ul>
          <p className="text-metadata text-text-muted">
            {ordenesFiltradas.length}{" "}
            {ordenesFiltradas.length === 1
              ? "orden pendiente"
              : "órdenes pendientes"}
          </p>
        </>
      )}
    </div>
  );
};
