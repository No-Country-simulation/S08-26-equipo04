import { z } from 'zod';

const faseBaseSchema = z.object({
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

export const faseCreateSchema = faseBaseSchema.extend({
  // El backend (CrearFaseRequestDTO, @NotEmpty) exige al menos un operario.
  operarios_ids: z
    .array(z.number())
    .min(1, 'Elegí al menos un operario'),
});

// En edicion los operarios no se tocan (se gestionan desde la pantalla de
// operarios por fase): el schema no los incluye.
export const faseEditSchema = faseBaseSchema;

export const faseSchema = faseCreateSchema;

export const faseDefaults = {
  codigo: '',
  nombre: '',
  descripcion: '',
  operarios_ids: [],
};
