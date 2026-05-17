import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../config/env.js';
const JWT_SECRET = env.JWT_SECRET;
/**
 * Middleware: requireAuth
 * Verifies that the JWT is valid and extracts the userId and role.
 * Injects the user info into the request (req.user) for downstream use.
 * Multi-tenant Rule: Controllers must use req.user.id for data ownership validation.
 */
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: 'Authentication token required',
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Securely inject the identity from the verified token
        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };
        return next();
    }
    catch (error) {
        return res.status(403).json({
            error: 'Invalid or expired session token',
        });
    }
};
/**
 * Middleware: requireSuperAdmin
 * Restricts access to users with the SUPER_ADMIN role.
 * This middleware MUST be executed after requireAuth.
 */
export const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required',
        });
    }
    if (req.user.role !== Role.SUPER_ADMIN) {
        return res.status(403).json({
            error: 'Access denied: Super Admin privileges required',
        });
    }
    return next();
};
//# sourceMappingURL=auth.middleware.js.map