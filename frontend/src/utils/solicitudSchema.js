import { z } from 'zod';

export const solicitudSchema = z.object({
  cliente_mode: z.enum(['registrado', 'nuevo']),
  cliente_id: z.preprocess((value) => value === '' ? undefined : Number(value), z.number().int().positive('Seleccioná un cliente').optional()),
  cliente_razon_social: z.string().trim().optional().or(z.literal('')),
  cliente_contacto: z.string().trim().optional().or(z.literal('')),
  cliente_telefono: z.string().trim().optional().or(z.literal('')),
  cliente_email: z.string().trim().email('Ingresá un correo válido').optional().or(z.literal('')),
  cliente_direccion: z.string().trim().optional().or(z.literal('')),
  descripcion_pieza: z.string().trim().min(1, 'Ingresá la descripción de la pieza'),
  cantidad: z.coerce.number().int('La cantidad debe ser un número entero').min(1, 'La cantidad debe ser mayor a 0'),
  fecha_esperada_entrega: z.string().optional().or(z.literal('')),
  notas_comerciales: z.string().trim().optional().or(z.literal('')),
  adjuntos: z.array(z.custom((file) => file instanceof File)).optional(),
}).superRefine((data, context) => {
  if (data.cliente_mode === 'registrado' && !data.cliente_id) {
    context.addIssue({ code: 'custom', path: ['cliente_id'], message: 'Seleccioná un cliente' });
  }
  if (data.cliente_mode === 'nuevo' && !data.cliente_razon_social) {
    context.addIssue({ code: 'custom', path: ['cliente_razon_social'], message: 'Ingresá la razón social' });
  }
});

export const solicitudDefaults = {
  cliente_mode: 'registrado',
  cliente_id: '',
  descripcion_pieza: '',
  cantidad: 1,
  fecha_esperada_entrega: '',
  notas_comerciales: '',
  adjuntos: [],
};