/**
 * Construccion de la lista de "Actividad reciente" del panel operativo.
 * Vive fuera del componente para que el archivo `.jsx` exporte solo JSX
 * (regla react-refresh) y para poder testear la logica sin montar nada.
 *
 * El destino de cada item lo define el rol: `pathOrden` llega desde
 * `paneles.config.js` porque el jefe no tiene ruta de detalle de OT.
 */

const getTimestamp = (item) =>
  Date.parse(
    item.updated_at ??
      item.updatedAt ??
      item.created_at ??
      item.createdAt ??
      "",
  ) || 0;

/** Los 5 movimientos mas recientes, entre solicitudes y ordenes de trabajo. */
export const buildActividad = ({ solicitudes, ordenes, pathOrden }) =>
  [
    ...solicitudes.map((item) => ({
      ...item,
      tipo: "Solicitud",
      codigo: item.numero_solicitud,
      path: "/solicitudes",
    })),
    ...ordenes.map((item) => ({
      ...item,
      tipo: "Orden de trabajo",
      codigo: item.numero_ot,
      path: pathOrden(item.numero_ot),
    })),
  ]
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .slice(0, 5);
