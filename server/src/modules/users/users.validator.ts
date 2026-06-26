import { z } from 'zod';
import { UserRole } from '../../types/enums';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').trim(),
  email: z.string().email('Format email tidak valid').trim(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.nativeEnum(UserRole, { error: () => ({ message: 'Role tidak valid' }) }),
  farm_id: z.string().min(1, 'Farm wajib diisi'),
  is_active: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  is_active: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'ID user wajib diisi'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
