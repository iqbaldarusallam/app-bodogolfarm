import { z } from 'zod';
import { UserRole } from '../../types/enums';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').trim(),
  email: z.string().email('Format email tidak valid').trim(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.nativeEnum(UserRole, { error: () => ({ message: 'Role tidak valid' }) }),
  farm_id: z.string().min(1, 'Farm wajib diisi'),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Password lama wajib diisi'),
  new_password: z.string().min(8, 'Password baru minimal 8 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
