import { Suspense, lazy, useEffect, useState } from "react";
import {
  Activity,
  ClipboardCheck,
  ClipboardList,
  Layers,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { apiGet, formatDateTime } from "../../api";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorBanner,
  SkeletonCard,
  SkeletonChart,
  Title,
} from "../../components/ui";

// FE-288: `recharts` va en chunk diferido (ver GraficosGerente.jsx).
const GraficosPlanta = lazy(() =>
  import("./GraficosGerente").then((m) => ({ default: m.GraficosPlanta })),
);
const GraficosCalidad = lazy(() =>
  import("./GraficosGerente").then((m) => ({ default: m.GraficosCalidad })),
);

/**
 * Panel del gerente. A diferencia de los paneles operativos no reutiliza
 * `PanelResumen`: consulta endpoints propios (/api/dashboard/planta y
 * /api/dashboard/calidad) y muestra graficos en lugar de tarjetas de conteo.
 */

// Clases explicitas por tono (sin interpolacion dinamica) para que Tailwind
// no las purgue. Mismo lenguaje visual que `MetricCard` de PanelResumen:
// icono + etiqueta + valor dentro de `Card`.
const TONE_STYLES = {
  primary: "bg-primary-tint text-primary",
  info: "bg-info-light text-info",
  warning: "bg-warning-light text-warning",
  success: "bg-success-light text-success",
  error: "bg-error-light text-error",
};

const StatCard = ({ icon: Icon, label, value, tone = "primary" }) => (
  <Card className="flex items-center gap-4">
    <span className={`rounded-lg p-3 ${TONE_STYLES[tone] ?? TONE_STYLES.primary}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <span>
      <span className="block text-metadata text-text-muted">{label}</span>
      <span className="block text-2xl font-semibold text-ink">{value}</span>
    </span>
  </Card>
);

const normalizarPlanta = (data) => {
  const fases = data?.fasesExistentes ?? data?.fases_existentes ?? {};
  return {
    pendientes: data?.cantidadPendientes ?? data?.cantidad_pendientes ?? 0,
    activas: data?.cantidadActivas ?? data?.cantidad_activas ?? 0,
    fases: Object.entries(fases).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    })),
    cuello:
      data?.cuelloDeBotella ??
      data?.cuello_de_botella ??
      "Sin acumulaciones críticas",
  };
};

const normalizarCalidad = (data) => {
  const conformidad = data?.conformidad ?? {};
  const retrabajos = data?.retrabajosPorFase ?? data?.retrabajos_por_fase ?? {};
  return {
    porcentaje:
      conformidad.porcentajeConformes ?? conformidad.porcentaje_conformes ?? 0,
    conformidad: [
      { nombre: "Conformes", cantidad: conformidad.conformes ?? 0 },
      {
        nombre: "No conformes",
        cantidad: conformidad.noConformes ?? conformidad.no_conformes ?? 0,
      },
    ],
    retrabajos: Array.isArray(retrabajos)
      ? retrabajos
      : Object.entries(retrabajos).map(([nombre, cantidad]) => ({
          nombre,
          cantidad,
        })),
    auditorias: data?.auditoriasRecientes ?? data?.auditorias_recientes ?? [],
    promedioMinutos:
      data?.tiempoPromedioCalidadMinutos ??
      data?.tiempo_promedio_calidad_minutos ??
      0,
  };
};

export const ManagerDashboard = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      apiGet("/api/dashboard/planta"),
      apiGet("/api/dashboard/calidad"),
    ]).then(
      ([planta, calidad]) => {
        if (cancelado) return;
        setDatos({
          planta: normalizarPlanta(planta.data),
          calidad: normalizarCalidad(calidad.data),
        });
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        // El backend manda el motivo en `mensaje` (ErrorResponse): leerlo
        // primero para no mostrar siempre el genérico.
        setError(
          err?.response?.data?.mensaje ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "No se pudieron cargar los dashboards.",
        );
        setCargando(false);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [version]);

  if (cargando)
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Title>Dashboard Gerente</Title>
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonChart title="Congestión por fase" />
        <SkeletonChart title="Resultados de calidad" />
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Title>Dashboard Gerente</Title>
        <ErrorBanner
          message={error}
          onRetry={() => {
            setError(null);
            setCargando(true);
            setVersion((value) => value + 1);
          }}
        />
      </div>
    );

  const { planta, calidad } = datos;
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Title>Dashboard Gerente</Title>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label text-primary">Visión global</p>
          <h1 className="mt-1 text-h1 text-ink">Planta y calidad</h1>
          <p className="mt-2 text-body text-text-secondary">
            Métricas globales para detectar acumulaciones y resultados de
            auditoría.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setDatos(null);
            setCargando(true);
            setVersion((value) => value + 1);
          }}
        >
          Actualizar
        </Button>
      </header>
      <section className="space-y-4">
        <div>
          <h2 className="text-h2 text-ink">Planta</h2>
          <p className="text-body text-text-secondary">
            Carga global y fases con mayor acumulación.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={ClipboardList}
            label="OTs pendientes"
            value={planta.pendientes}
            tone="warning"
          />
          <StatCard
            icon={Activity}
            label="OTs activas"
            value={planta.activas}
            tone="info"
          />
          <StatCard
            icon={Layers}
            label="Fases en catálogo"
            value={planta.fases.length}
            tone="primary"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <Suspense fallback={<SkeletonChart title="OTs acumuladas por fase" />}>
            <GraficosPlanta fases={planta.fases} />
          </Suspense>
          <Card>
            <CardHeader>
              <CardTitle>Cuello de botella</CardTitle>
            </CardHeader>
            <p className="rounded-lg bg-warning-light p-4 text-label text-text-secondary">
              {planta.cuello}
            </p>
          </Card>
        </div>
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="text-h2 text-ink">Calidad</h2>
          <p className="text-body text-text-secondary">
            Conformidad, retrabajos y auditorías recientes.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={ShieldCheck}
            label="Conformidad"
            value={`${Number(calidad.porcentaje).toFixed(1)}%`}
            tone="success"
          />
          <StatCard
            icon={Timer}
            label="Tiempo promedio en calidad"
            value={`${Math.round((calidad.promedioMinutos / 60) * 10) / 10} h`}
            tone="info"
          />
          <StatCard
            icon={ClipboardCheck}
            label="Auditorías recientes"
            value={calidad.auditorias.length}
            tone="primary"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<SkeletonChart title="Conformes vs. no conformes" />}>
            <GraficosCalidad calidad={calidad} />
          </Suspense>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Últimas auditorías</CardTitle>
          </CardHeader>
          {calidad.auditorias.length ? (
            <div className="divide-y divide-border">
              {calidad.auditorias.map((auditoria, index) => (
                <div
                  key={auditoria.id ?? index}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-label text-ink">
                      {/* El backend manda snake_case: leer numero_ot/id_ot
                          primero (con fallback a las grafías viejas). */}
                      <span className="font-semibold">
                        {auditoria.numero_ot ??
                          auditoria.numeroOt ??
                          auditoria.ot_numero ??
                          `OT #${auditoria.id_ot ?? auditoria.idOt ?? "—"}`}
                      </span>
                      <span className="text-text-muted">
                        <span aria-hidden="true" className="mx-2">
                          ·
                        </span>
                        {formatDateTime(
                          auditoria.fecha_auditoria ??
                            auditoria.fechaAuditoria ??
                            auditoria.fecha_veredicto,
                        )}
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant={
                      auditoria.resultado === "CONFORME"
                        ? "approved"
                        : "quality"
                    }
                  >
                    {auditoria.resultado ?? "Pendiente"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin auditorías recientes"
              description="Todavía no hay auditorías registradas."
            />
          )}
        </Card>
      </section>
    </div>
  );
};
