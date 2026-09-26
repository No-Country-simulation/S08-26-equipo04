/**
 * Construccion de la lista de "Actividad reciente" del panel operativo.
 * Vive fuera del componente para que el archivo `.jsx` exporte solo JSX
 * (regla react-refresh) y para poder testear la logica sin montar nada.
 *
 * La lista es de solo lectura, asi que no arma ningun destino de navegacion:
 * los items solo llevan lo que se dibuja.
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
export const buildActividad = ({ solicitudes, ordenes }) =>
  [
    ...solicitudes.map((item) => ({
      ...item,
      tipo: "Solicitud",
      codigo: item.numero_solicitud,
    })),
    ...ordenes.map((item) => ({
      ...item,
      tipo: "Orden de trabajo",
      codigo: item.numero_ot,
    })),
  ]
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .slice(0, 5);
