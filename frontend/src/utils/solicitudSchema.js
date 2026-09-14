import { z } from 'zod';

export const solicitudSchema = z.object({
  cliente_id: z.coerce.number().int().positive('Seleccioná un cliente'),
  descripcion_pieza: z.string().trim().min(1, 'Ingresá la descripción de la pieza'),
  cantidad: z.coerce.number().int('La cantidad debe ser un número entero').min(1, 'La cantidad debe ser mayor a 0'),
  fecha_esperada_entrega: z.string().optional().or(z.literal('')),
  notas_comerciales: z.string().trim().optional().or(z.literal('')),
  adjuntos: z.array(z.custom((file) => file instanceof File)).optional(),
});

export const solicitudDefaults = {
  cliente_id: '',
  descripcion_pieza: '',
  cantidad: 1,
  fecha_esperada_entrega: '',
  notas_comerciales: '',
  adjuntos: [],
};