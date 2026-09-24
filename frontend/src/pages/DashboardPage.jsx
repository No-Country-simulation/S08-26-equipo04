import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock3, RefreshCcw, ShieldAlert, Wrench } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiGet, formatDateTime } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, CardHeader, CardTitle, EmptyState, ErrorBanner, SkeletonCard, SkeletonChart, Title } from "../components/ui";

const COLORS = ["#177245", "#d97706", "#b42318", "#667085"];

const plantaValue = (data, camel, snake, fallback = 0) =>
  data?.[camel] ?? data?.[snake] ?? fallback;

const normalizarPlanta = (data) => {
  const fases = data?.fasesExistentes ?? data?.fases_existentes ?? {};
  return {
    pendientes: plantaValue(data, "cantidadPendientes", "cantidad_pendientes"),
    activas: plantaValue(data, "cantidadActivas", "cantidad_activas"),
    fases: Object.entries(fases).map(([nombre, cantidad]) => ({ nombre, cantidad })),
    cuello: data?.cuelloDeBotella ?? data?.cuello_de_botella ?? "Sin acumulaciones críticas",
  };
};

const normalizarCalidad = (data) => {
  const conformidad = data?.conformidad ?? {};
  const auditorias = data?.auditoriasRecientes ?? data?.auditorias_recientes ?? [];
  const retrabajos = data?.retrabajosPorFase ?? data?.retrabajos_por_fase ?? {};
  return {
    conformidad: [
      { nombre: "Conformes", cantidad: conformidad.conformes ?? 0 },
      { nombre: "No conformes", cantidad: conformidad.noConformes ?? conformidad.no_conformes ?? 0 },
    ],
    porcentaje: conformidad.porcentajeConformes ?? conformidad.porcentaje_conformes ?? 0,
    retrabajos: Array.isArray(retrabajos)
      ? retrabajos
      : Object.entries(retrabajos).map(([nombre, cantidad]) => ({ nombre, cantidad })),
    auditorias,
    promedioMinutos: data?.tiempoPromedioCalidadMinutos ?? data?.tiempo_promedio_calidad_minutos ?? 0,
  };
};

const Metric = ({ label, value, icon: Icon, tone = "primary" }) => (
  <Card className="flex items-center gap-4">
    <span className={`rounded-lg p-3 text-${tone} bg-${tone}-light`}><Icon className="h-5 w-5" /></span>
    <div><p className="text-metadata text-text-muted">{label}</p><p className="text-2xl font-semibold text-ink">{value}</p></div>
  </Card>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.rol !== "GERENTE") {
      return undefined;
    }
    let cancelado = false;
    Promise.all([apiGet("/api/dashboard/planta"), apiGet("/api/dashboard/calidad")]).then(
      ([planta, calidad]) => {
        if (cancelado) return;
        setDatos({ planta: normalizarPlanta(planta.data), calidad: normalizarCalidad(calidad.data) });
        setError(null);
        setCargando(false);
      },
      (err) => {
        if (cancelado) return;
        setError(err?.response?.data?.message || err?.response?.data?.error || "No se pudieron cargar los dashboards.");
        setCargando(false);
      },
    );
    return () => { cancelado = true; };
  }, [user?.rol]);

  const recargar = () => {
    setDatos(null);
    setError(null);
    setCargando(true);
    window.location.reload();
  };

  if (user?.rol !== "GERENTE") {
    return <div className="mx-auto max-w-7xl"><Title>Panel general</Title><EmptyState title="Panel no disponible" description="Este panel está reservado para el rol Gerente." /></div>;
  }
  if (cargando) return <div className="mx-auto max-w-7xl space-y-6"><Title>Dashboard Gerente</Title><SkeletonCard /><SkeletonChart title="Congestión por fase" /><SkeletonChart title="Resultados de calidad" /></div>;
  if (error) return <div className="mx-auto max-w-7xl space-y-6"><Title>Dashboard Gerente</Title><ErrorBanner message={error} onRetry={recargar} /></div>;

  const { planta, calidad } = datos;
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Title>Dashboard Gerente</Title>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-label text-primary">Visión global</p><h1 className="mt-1 text-h1 text-ink">Planta y calidad</h1><p className="mt-2 text-body text-text-secondary">Métricas operativas para detectar acumulaciones y resultados de auditoría.</p></div>
        <Button variant="secondary" onClick={recargar}><RefreshCcw className="h-4 w-4" />Actualizar</Button>
      </header>

      <section className="space-y-4" aria-labelledby="planta-title">
        <div><h2 id="planta-title" className="text-h2 text-ink">Planta</h2><p className="text-body text-text-secondary">Carga global y fases con mayor acumulación.</p></div>
        <div className="grid gap-4 md:grid-cols-3"><Metric label="OTs pendientes" value={planta.pendientes} icon={Clock3} /><Metric label="OTs activas" value={planta.activas} icon={Activity} tone="info" /><Metric label="Fases en catálogo" value={planta.fases.length} icon={Wrench} tone="warning" /></div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <Card><CardHeader><CardTitle>OTs acumuladas por fase</CardTitle></CardHeader>{planta.fases.length ? <ResponsiveContainer width="100%" height={280}><BarChart data={planta.fases} margin={{ top: 8, right: 12, bottom: 24, left: 0 }}><XAxis dataKey="nombre" angle={-25} textAnchor="end" height={56} tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="cantidad" name="OTs" fill="#177245" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="Sin fases registradas" description="No hay acumulaciones para mostrar." />}</Card>
          <Card><CardHeader><CardTitle>Cuello de botella</CardTitle></CardHeader><div className="rounded-lg bg-warning-light p-4 text-label text-text-secondary"><ShieldAlert className="mb-2 h-5 w-5 text-warning" /><p>{planta.cuello}</p></div></Card>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="calidad-title">
        <div><h2 id="calidad-title" className="text-h2 text-ink">Calidad</h2><p className="text-body text-text-secondary">Conformidad, retrabajos y auditorías recientes.</p></div>
        <div className="grid gap-4 md:grid-cols-3"><Metric label="Conformidad" value={`${Number(calidad.porcentaje).toFixed(1)}%`} icon={CheckCircle2} tone="success" /><Metric label="Tiempo promedio en calidad" value={`${Math.round(calidad.promedioMinutos / 60 * 10) / 10} h`} icon={Clock3} tone="info" /><Metric label="Auditorías recientes" value={calidad.auditorias.length} icon={ShieldAlert} tone="warning" /></div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Conformes vs. no conformes</CardTitle></CardHeader><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={calidad.conformidad} dataKey="cantidad" nameKey="nombre" cx="50%" cy="50%" outerRadius={82} label>{calidad.conformidad.map((item, index) => <Cell key={item.nombre} fill={COLORS[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Card>
          <Card><CardHeader><CardTitle>Retrabajos por fase</CardTitle></CardHeader>{calidad.retrabajos.length ? <ResponsiveContainer width="100%" height={250}><BarChart data={calidad.retrabajos} margin={{ bottom: 24 }}><XAxis dataKey="nombre" angle={-25} textAnchor="end" height={56} tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="cantidad" name="Retrabajos" fill="#b42318" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="Sin retrabajos" description="No hay retrabajos registrados por fase." />}</Card>
        </div>
        <Card><CardHeader><CardTitle>Últimas auditorías</CardTitle></CardHeader>{calidad.auditorias.length ? <div className="divide-y divide-border">{calidad.auditorias.map((auditoria, index) => <div key={auditoria.id ?? `${auditoria.numeroOt}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-label font-semibold text-ink">{auditoria.numeroOt ?? auditoria.ot_numero ?? `OT #${auditoria.idOt ?? "—"}`}</p><p className="text-metadata text-text-muted">{formatDateTime(auditoria.fechaAuditoria ?? auditoria.fecha_veredicto)} </p></div><Badge variant={auditoria.resultado === "CONFORME" ? "approved" : "quality"}>{auditoria.resultado ?? "Pendiente"}</Badge></div>)}</div> : <EmptyState title="Sin auditorías recientes" description="Todavía no hay auditorías registradas." />}</Card>
      </section>
    </div>
  );
};
