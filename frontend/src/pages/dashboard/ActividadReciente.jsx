import { formatDateTime } from "../../api";
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  SkeletonCard,
} from "../../components/ui";
import { estadoInfo } from "./estados";

/**
 * Lista de actividad reciente del panel operativo. Es presentacional y de solo
 * lectura: recibe los items ya armados (con `tipo`, `codigo` y
 * `cliente_razon_social`, ver `actividad.js`) y solo los dibuja. No navega: la
 * unica forma de entrar a una seccion desde el panel son las tarjetas de
 * conteo de `PanelResumen`.
 */

export const ActividadReciente = ({ items, cargando }) => (
  <Card>
    <CardHeader>
      <CardTitle>Actividad reciente</CardTitle>
      <p className="mt-1 text-metadata text-text-muted">
        Informativo. Usá las tarjetas para redirigirte a cada sección.
      </p>
    </CardHeader>
    {cargando ? (
      <SkeletonCard rows={4} />
    ) : items.length === 0 ? (
      <EmptyState
        title="Sin actividad reciente"
        description="Tus solicitudes y órdenes aparecerán aquí cuando tengan movimientos."
      />
    ) : (
      <ul className="divide-y divide-border">
        {items.map((item, index) => {
          const estado = estadoInfo(item.estado);
          return (
            <li
              key={`${item.tipo}-${item.id ?? index}`}
              className="flex items-center gap-4 py-3"
            >
              <p className="shrink-0 text-label text-ink">
                {item.codigo || `${item.tipo} #${item.id}`}
              </p>
              <span
                aria-hidden="true"
                className="h-4 w-px shrink-0 bg-border"
              />
              <p className="ml-3 min-w-0 flex-1 truncate text-metadata text-text-muted">
                {[item.tipo, item.cliente_razon_social]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                ·{" "}
                {formatDateTime(
                  item.updated_at ??
                    item.updatedAt ??
                    item.created_at ??
                    item.createdAt,
                )}
              </p>
              <Badge variant={estado.variant}>{estado.label}</Badge>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);
