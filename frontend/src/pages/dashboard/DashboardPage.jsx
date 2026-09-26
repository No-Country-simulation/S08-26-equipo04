import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCotizaciones } from "../../hooks/useCotizaciones";
import { useOrdenesTrabajo } from "../../hooks/useOrdenesTrabajo";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import { buildActividad } from "./actividad";
import { ManagerDashboard } from "./ManagerDashboard";
import { PanelResumen, SinPanel } from "./PanelResumen";
import { PANELES } from "./paneles.config";

/**
 * Orquestador del inicio. Solo decide que panel renderizar y de que datos se
 * alimenta: las diferencias entre roles operativos viven en `paneles.config.js`
 * y el gerente tiene su propio componente. Este archivo no deberia crecer con
 * logica de presentacion.
 */

const belongsToUser = (item, user) => {
  const vendedorId = item.vendedor_id ?? item.vendedorId;
  return vendedorId == null || Number(vendedorId) === Number(user?.id);
};

// Aplica la regla de visibilidad del rol. Es una funcion pura a proposito:
// si fuera interna al componente, rehaceria los useMemo en cada render.
const visiblesPara = (items, panel, user) =>
  panel?.filtraPorVendedor
    ? items.filter((item) => belongsToUser(item, user))
    : items;

export const DashboardPage = () => {
  const { user } = useAuth();
  const solicitudesState = useSolicitudes();
  const cotizacionesState = useCotizaciones();
  const ordenesState = useOrdenesTrabajo();

  // Identidad estable entre renders (viene de un modulo), asi que sirve como
  // dependencia de los useMemo.
  const panel = PANELES[user?.rol];

  const solicitudes = useMemo(
    () => visiblesPara(solicitudesState.solicitudes, panel, user),
    [solicitudesState.solicitudes, panel, user],
  );
  const cotizaciones = useMemo(
    () => visiblesPara(cotizacionesState.cotizaciones, panel, user),
    [cotizacionesState.cotizaciones, panel, user],
  );
  const ordenes = ordenesState.ordenesTrabajo;

  const actividad = useMemo(
    () =>
      panel
        ? buildActividad({
            solicitudes,
            ordenes,
            pathOrden: panel.detalleOrdenPath,
          })
        : [],
    [solicitudes, ordenes, panel],
  );

  const cargando =
    solicitudesState.cargando ||
    cotizacionesState.cargando ||
    ordenesState.cargando;
  const error =
    solicitudesState.error || cotizacionesState.error || ordenesState.error;

  if (user?.rol === "GERENTE") return <ManagerDashboard />;

  if (panel) {
    return (
      <PanelResumen
        config={panel}
        values={panel.count({ solicitudes, cotizaciones, ordenes })}
        actividad={actividad}
        cargando={cargando}
        error={error}
      />
    );
  }

  return <SinPanel />;
};
