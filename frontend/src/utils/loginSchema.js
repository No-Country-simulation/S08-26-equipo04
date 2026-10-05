import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido'),
  // Minimo alineado con las cuentas semilla actuales (6 caracteres).
  // Si backend unifica todo a 8+, subir este minimo a 8.
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

export const loginDefaults = {
  email: '',
  password: '',
};