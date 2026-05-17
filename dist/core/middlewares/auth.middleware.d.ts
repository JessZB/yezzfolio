import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
/**
 * Extend the Express Request interface to include the user object.
 */
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
/**
 * Middleware: requireAuth
 * Verifies that the JWT is valid and extracts the userId and role.
 * Injects the user info into the request (req.user) for downstream use.
 * Multi-tenant Rule: Controllers must use req.user.id for data ownership validation.
 */
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: requireSuperAdmin
 * Restricts access to users with the SUPER_ADMIN role.
 * This middleware MUST be executed after requireAuth.
 */
export declare const requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
