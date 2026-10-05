// Criterios del checklist de calidad (HU-4.2). Nombres tomados del mock
// auditorias.json para que el payload nuevo sea consistente con el histórico.
export const CRITERIOS_CHECKLIST = [
  { item_numero: 1, criterio_nombre: "Conformidad dimensional" },
  { item_numero: 2, criterio_nombre: "Fases completas" },
  { item_numero: 3, criterio_nombre: "Terminación/acabado" },
  { item_numero: 4, criterio_nombre: "Cantidad" },
  { item_numero: 5, criterio_nombre: "Identificación" },
  { item_numero: 6, criterio_nombre: "Prueba funcional" },
  { item_numero: 7, criterio_nombre: "Documentación de respaldo" },
];

export const OPCIONES_CHECKLIST = [
  { valor: "CUMPLE", label: "Cumple" },
  { valor: "NO_CUMPLE", label: "No cumple" },
  { valor: "NO_APLICA", label: "No aplica" },
];

export const VEREDICTOS = [
  { valor: "CONFORME", label: "Conforme" },
  { valor: "NO_CONFORME", label: "No conforme" },
];
