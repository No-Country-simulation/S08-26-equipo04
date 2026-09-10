import { z } from 'zod';

export const faseSchema = z.object({
  codigo: z
    .string()
    .min(1, 'El codigo es obligatorio')
    .max(20, 'Maximo 20 caracteres')
    .regex(/^[A-Z_]+$/, 'Solo mayusculas y guiones bajos'),
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'Maximo 100 caracteres'),
  descripcion: z
    .string()
    .max(500, 'Maximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export const faseDefaults = {
  codigo: '',
  nombre: '',
  descripcion: '',
};
