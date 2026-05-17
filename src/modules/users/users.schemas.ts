import { z } from 'zod';
import { Role } from '@prisma/client';

export const inviteUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.nativeEnum(Role).optional().default(Role.ARTIST),
  }),
});
