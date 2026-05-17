// Global TypeScript types shared across all modules

import { Role } from '@prisma/client';

// Extends Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
