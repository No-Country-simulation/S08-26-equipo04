import { z } from 'zod';

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
  precio_final: z
    .number()
    .min(0, 'El precio no puede ser negativo'),
  observaciones: z.string().optional().or(z.literal('')),
});

export const cotizacionDefaults = {
  fases: [],
  precio_final: 0,
  observaciones: '',
};
