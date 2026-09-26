import { useNavigate } from "react-router-dom";
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
 * Lista de actividad reciente del panel operativo. Es presentacional: recibe
 * los items ya armados (con `tipo`, `codigo`, `path` y `cliente_razon_social`,
 * ver `actividad.js`) y solo los dibuja.
 */

export const ActividadReciente = ({ items, cargando }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      {cargando ? (
        <SkeletonCard rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin actividad reciente"
          description="Tus solicitudes y órdenes aparecerán aquí cuando tengan movimientos."
        />
      ) : (
        <div className="divide-y divide-border">
          {items.map((item, index) => {
            const estado = estadoInfo(item.estado);
            return (
              <button
                key={`${item.tipo}-${item.id ?? index}`}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex w-full items-center gap-4 py-3 text-left hover:bg-canvas"
              >
                <p className="shrink-0 text-label text-ink">
                  {item.codigo || `${item.tipo} #${item.id}`}
                </p>
                <span
                  aria-hidden="true"
                  className="h-4 w-px shrink-0 bg-border"
                />
                <p className="ml-3 min-w-0 flex-1 truncate text-left text-metadata text-text-muted">
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
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
};
