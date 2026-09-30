import { z } from 'zod';
import { parseImporte } from './importe';

const faseSecuenciaSchema = z.object({
  fase_catalogo_id: z.number(),
  fase_nombre: z.string(),
  tiempo_estimado_minutos: z
    .number()
    .min(1, 'El tiempo debe ser mayor a 0'),
  instrucciones_fase: z.string(),
});

export const cotizacionSchema = z.object({
  fases: z
    .array(faseSecuenciaSchema)
    .min(1, 'Agregá al menos una fase'),
  // El campo llega como texto (para no perder el formato que escribe el
  // usuario) y se normaliza acá. `parseImporte` devuelve `undefined` si esta
  // vacio y `null` si hay texto que no se puede interpretar, y cada caso
  // reporta su propia causa en vez de "El precio debe ser mayor a cero".
  precio_final: z.preprocess(
    (valor) => parseImporte(valor),
    z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? 'Ingresá el importe de la cotización'
            : 'Ingresá un importe válido, por ejemplo 24.500,50',
      })
      .min(0.01, 'El precio debe ser mayor a cero'),
  ),
  observaciones: z.string().optional().or(z.literal('')),
});

export const cotizacionDefaults = {
  fases: [],
  precio_final: '',
  observaciones: '',
};
