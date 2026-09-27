/**
 * Estado -> variante de `Badge` + etiqueta legible para la actividad reciente.
 *
 * Antes el panel usaba un ternario que solo reconocia EN_PRODUCCION y DESPACHO:
 * todo lo demas caia en la variante `queue`, que es un gris casi blanco, y por
 * eso los badges se veian sin color. Este mapa reutiliza el mismo vocabulario
 * de variantes y etiquetas que ya usan los listados, para que un estado se vea
 * igual en el panel y en las tablas:
 *   - SolicitudesPage.jsx  (pending, quoted)
 *   - CotizacionesPage.jsx (pending, quoted, approved, production)
 *   - OrdenesTrabajoPage.jsx (production, quality, pending, approved)
 *
 * Los estados de OT ausentes (EN_EJECUCION, TERMINADO) no llegan a esta lista
 * porque la actividad solo muestra solicitudes y ordenes de trabajo.
 */

const ESTADOS = {
  // Solicitudes
  PENDIENTE_COTIZACION: { variant: "pending", label: "Pendiente de cotización" },
  COTIZADA: { variant: "quoted", label: "Cotizada" },
  // Cotizaciones
  LISTA_PARA_ENVIAR: { variant: "pending", label: "Lista para enviar" },
  ENVIADA_A_CLIENTE: { variant: "quoted", label: "Enviada al cliente" },
  APROBADA: { variant: "approved", label: "Aprobada" },
  NO_APROBADA: { variant: "production", label: "No aprobada" },
  // Ordenes de trabajo
  EN_PRODUCCION: { variant: "production", label: "En producción" },
  EN_CALIDAD: { variant: "quality", label: "En calidad" },
  NO_CONFORME: { variant: "quality", label: "No conforme" },
  DESPACHO: { variant: "pending", label: "Lista para entregar" },
  ENTREGADA: { variant: "approved", label: "Entregada" },
};

export const estadoInfo = (estado) =>
  ESTADOS[estado] ?? {
    variant: "queue",
    label: (estado ?? "").replace(/_/g, " "),
  };
