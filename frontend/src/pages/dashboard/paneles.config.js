import {
  ClipboardList,
  Clock3,
  FileText,
  ListChecks,
  PackageCheck,
  ShieldCheck,
  TriangleAlert,
  Truck,
  Users,
} from "lucide-react";

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

// Operario activo = con carga pendiente: al menos una fase EN_COLA o
// EN_EJECUCION (definición BE/PM). No es "habilitado" (usuarios.activo) y
// deja afuera a quienes tienen todo TERMINADO o solo PENDIENTE.
const contarOperariosActivos = (fases) =>
  new Set(
    (fases ?? [])
      .filter(
        (fase) =>
          fase.estado === "EN_COLA" || fase.estado === "EN_EJECUCION",
      )
      .map((fase) => fase.operario_id ?? fase.operarioId)
      .filter(Boolean),
  ).size;

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
    encabezado: "Gestión de planta",
    detalle:
      "Acceso rápido a tus funcionalidades y vista de actividad reciente.",
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
      {
        key: "calidad",
        label: "OTs en calidad",
        icon: ShieldCheck,
        path: "/ordenes-trabajo?estado=EN_CALIDAD",
        tone: "info",
      },
      {
        key: "noConformes",
        label: "No conformes",
        icon: TriangleAlert,
        path: "/ordenes-trabajo?estado=NO_CONFORME",
        tone: "error",
      },
      {
        key: "despacho",
        label: "OTs en despacho",
        icon: Truck,
        path: "/ordenes-trabajo?estado=DESPACHO",
        tone: "success",
      },
      {
        key: "fasesPendientes",
        label: "Fases pendientes",
        icon: ListChecks,
        path: "/planta",
        tone: "warning",
      },
      {
        key: "operariosActivos",
        label: "Operarios activos",
        icon: Users,
        path: "/planta",
        tone: "primary",
      },
    ],
    // Las claves deben coincidir con las de `cards` de este mismo rol.
    // `fases` (ot-fases del contexto global) alimenta las cards de carga de
    // operarios; los demas roles la ignoran.
    count: ({ solicitudes, ordenes, fases }) => ({
      solicitudes: contarEstado(solicitudes, "PENDIENTE_COTIZACION"),
      produccion: contarEstado(ordenes, "EN_PRODUCCION"),
      entregadas: contarEstado(ordenes, "ENTREGADA"),
      calidad: contarEstado(ordenes, "EN_CALIDAD"),
      noConformes: contarEstado(ordenes, "NO_CONFORME"),
      despacho: contarEstado(ordenes, "DESPACHO"),
      fasesPendientes: contarEstado(fases ?? [], "EN_COLA"),
      operariosActivos: contarOperariosActivos(fases),
    }),
  },
};
