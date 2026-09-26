import { ClipboardList, Clock3, FileText, PackageCheck } from "lucide-react";

/**
 * Configuracion declarativa de los paneles operativos: VENDEDOR y
 * JEFE_PRODUCCION.
 *
 * Ambos roles comparten el mismo componente base (`PanelResumen`) para que el
 * formato y el comportamiento se vean iguales. Todo lo que cambia entre roles
 * es DATO, no logica: textos, tarjetas, estados contados y a donde apunta cada
 * enlace. Por eso el componente base no tiene ningun `if` por rol.
 *
 * Si un rol necesita un comportamiento distinto (no solo otros numeros), no se
 * agrega una entrada mas aca: se crea su propio componente, como
 * `ManagerDashboard` para el gerente, que consume otros endpoints y muestra
 * graficos en lugar de tarjetas.
 *
 * Para sumar un panel operativo nuevo: se agrega la entrada del rol y nada mas.
 */

const contarEstado = (items, estado) =>
  items.filter((item) => item.estado === estado).length;

export const PANELES = {
  VENDEDOR: {
    titulo: "Panel del vendedor",
    eyebrow: "Panel comercial",
    encabezado: "Resumen de mi operación",
    detalle:
      "Accesos rápidos al estado de tus solicitudes, cotizaciones y órdenes.",
    // El vendedor solo ve las solicitudes y cotizaciones que le pertenecen.
    filtraPorVendedor: true,
    cards: [
      {
        key: "solicitudes",
        label: "Mis solicitudes pendientes",
        icon: ClipboardList,
        path: "/solicitudes?estado=PENDIENTE_COTIZACION",
        tone: "primary",
      },
      {
        key: "cotizaciones",
        label: "Cotizaciones esperando respuesta",
        icon: FileText,
        path: "/cotizaciones?estado=ENVIADA_A_CLIENTE",
        tone: "info",
      },
      {
        key: "produccion",
        label: "OTs en producción",
        icon: Clock3,
        path: "/ordenes-trabajo?estado=EN_PRODUCCION",
        tone: "warning",
      },
      {
        key: "despacho",
        label: "OTs en despacho",
        icon: PackageCheck,
        path: "/ordenes-trabajo?estado=DESPACHO",
        tone: "success",
      },
    ],
    // Las claves deben coincidir con las de `cards` de este mismo rol.
    count: ({ solicitudes, cotizaciones, ordenes }) => ({
      solicitudes: contarEstado(solicitudes, "PENDIENTE_COTIZACION"),
      cotizaciones: contarEstado(cotizaciones, "ENVIADA_A_CLIENTE"),
      produccion: contarEstado(ordenes, "EN_PRODUCCION"),
      despacho: contarEstado(ordenes, "DESPACHO"),
    }),
  },

  JEFE_PRODUCCION: {
    titulo: "Panel del jefe",
    eyebrow: "Panel de producción",
    encabezado: "Cotizaciones y planta",
    detalle:
      "Accesos rápidos a las solicitudes por cotizar, las cotizaciones para enviar y el estado de la planta.",
    // El jefe ve la lista completa: el backend no filtra solicitudes ni
    // cotizaciones por rol, las devuelve todas.
    filtraPorVendedor: false,
    cards: [
      {
        key: "solicitudes",
        label: "Solicitudes por cotizar",
        icon: ClipboardList,
        path: "/solicitudes?estado=PENDIENTE_COTIZACION",
        tone: "primary",
      },
      {
        key: "cotizaciones",
        label: "Cotizaciones para enviar",
        icon: FileText,
        path: "/cotizaciones?estado=LISTA_PARA_ENVIAR",
        tone: "info",
      },
      {
        key: "produccion",
        label: "OTs en producción",
        icon: Clock3,
        path: "/planta",
        tone: "warning",
      },
      {
        key: "entregadas",
        label: "Órdenes entregadas",
        icon: PackageCheck,
        path: "/ordenes-entregadas",
        tone: "success",
      },
    ],
    count: ({ solicitudes, cotizaciones, ordenes }) => ({
      solicitudes: contarEstado(solicitudes, "PENDIENTE_COTIZACION"),
      cotizaciones: contarEstado(cotizaciones, "LISTA_PARA_ENVIAR"),
      produccion: contarEstado(ordenes, "EN_PRODUCCION"),
      entregadas: contarEstado(ordenes, "ENTREGADA"),
    }),
  },
};
