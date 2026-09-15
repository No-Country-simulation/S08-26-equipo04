import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
});

export const loginDefaults = {
  email: '',
  password: '',
};