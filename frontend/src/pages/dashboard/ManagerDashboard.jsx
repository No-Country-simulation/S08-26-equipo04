import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

/**
 * Panel del gerente. A diferencia de los paneles operativos no reutiliza
 * `PanelResumen`: consulta endpoints propios (/api/dashboard/planta y
 * /api/dashboard/calidad) y muestra graficos en lugar de tarjetas de conteo.
 */

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
        setError(
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
          <Card>
            <p className="text-metadata text-text-muted">OTs pendientes</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {planta.pendientes}
            </p>
          </Card>
          <Card>
            <p className="text-metadata text-text-muted">OTs activas</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {planta.activas}
            </p>
          </Card>
          <Card>
            <p className="text-metadata text-text-muted">Fases en catálogo</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {planta.fases.length}
            </p>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>OTs acumuladas por fase</CardTitle>
            </CardHeader>
            {planta.fases.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={planta.fases} margin={{ bottom: 28 }}>
                  <XAxis
                    dataKey="nombre"
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="cantidad"
                    name="OTs"
                    fill="#177245"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sin fases registradas"
                description="No hay acumulaciones para mostrar."
              />
            )}
          </Card>
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
          <Card>
            <p className="text-metadata text-text-muted">Conformidad</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {Number(calidad.porcentaje).toFixed(1)}%
            </p>
          </Card>
          <Card>
            <p className="text-metadata text-text-muted">
              Tiempo promedio en calidad
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {Math.round((calidad.promedioMinutos / 60) * 10) / 10} h
            </p>
          </Card>
          <Card>
            <p className="text-metadata text-text-muted">
              Auditorías recientes
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {calidad.auditorias.length}
            </p>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Conformes vs. no conformes</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={calidad.conformidad}
                  dataKey="cantidad"
                  nameKey="nombre"
                  outerRadius={82}
                  label
                >
                  {calidad.conformidad.map((item, index) => (
                    <Cell
                      key={item.nombre}
                      fill={["#177245", "#b42318"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Retrabajos por fase</CardTitle>
            </CardHeader>
            {calidad.retrabajos.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={calidad.retrabajos} margin={{ bottom: 28 }}>
                  <XAxis
                    dataKey="nombre"
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="cantidad"
                    name="Retrabajos"
                    fill="#b42318"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sin retrabajos"
                description="No hay retrabajos registrados por fase."
              />
            )}
          </Card>
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
                  <div>
                    <p className="text-label font-semibold text-ink">
                      {auditoria.numeroOt ??
                        auditoria.ot_numero ??
                        `OT #${auditoria.idOt ?? "—"}`}
                    </p>
                    <p className="text-metadata text-text-muted">
                      {formatDateTime(
                        auditoria.fechaAuditoria ?? auditoria.fecha_veredicto,
                      )}
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
