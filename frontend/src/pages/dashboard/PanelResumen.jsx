import { useNavigate } from "react-router-dom";
import {
  EmptyState,
  ErrorBanner,
  SkeletonCard,
  Title,
} from "../../components/ui";
import { ActividadReciente } from "./ActividadReciente";

/**
 * Panel base de los roles operativos (vendedor y jefe de produccion).
 *
 * Es deliberadamente tonto: recibe la configuracion del rol desde
 * `paneles.config.js` y los numeros ya calculados, y solo compone el layout
 * (encabezado + tarjetas + actividad). No debe crecer con condiciones por rol:
 * si un panel necesita otra estructura, se hace su propio componente.
 */

const MetricCard = ({ item, value, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex w-full items-center gap-4 text-left hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <span
        className={`rounded-lg bg-${item.tone}-light p-3 text-${item.tone}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-metadata text-text-muted">
          {item.label}
        </span>
        <span className="block text-2xl font-semibold text-ink">{value}</span>
      </span>
    </button>
  );
};

export const PanelResumen = ({ config, values, actividad, cargando, error }) => {
  const navigate = useNavigate();
  const { titulo, eyebrow, encabezado, detalle, cards } = config;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Title>{titulo}</Title>
      <header>
        <p className="text-label text-primary">{eyebrow}</p>
        <h1 className="mt-1 text-h1 text-ink">{encabezado}</h1>
        <p className="mt-2 text-body text-text-secondary">{detalle}</p>
      </header>

      {error && <ErrorBanner message={error} />}

      {cargando ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((item) => (
            <SkeletonCard key={item.key} rows={1} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((item) => (
            <MetricCard
              key={item.key}
              item={item}
              value={values[item.key]}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      )}

      <ActividadReciente items={actividad} cargando={cargando} />
    </div>
  );
};

export const SinPanel = () => (
  <div className="mx-auto max-w-7xl space-y-6">
    <Title>Panel general</Title>
    <EmptyState
      title="No hay un panel disponible para tu rol"
      description="Selecciona una sección del menú para continuar."
    />
  </div>
);
