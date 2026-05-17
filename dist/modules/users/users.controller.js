import { UsersService } from './users.service.js';
/**
 * UsersController
 * Entry point for user-related HTTP requests.
 * Delegating logic to UsersService.
 */
export class UsersController {
    /**
     * Invite a new artist to the platform.
     */
    static async invite(req, res, next) {
        const { email, role } = req.body;
        try {
            const user = await UsersService.inviteUser(email, role);
            return res.status(201).json(user);
        }
        catch (error) {
            if (error.message === 'USER_ALREADY_EXISTS') {
                return res.status(400).json({ error: 'Este correo ya está en la lista.' });
            }
            next(error);
        }
    }
    /**
     * Get global stats for the super admin dashboard.
     */
    static async getStats(req, res, next) {
        try {
            const stats = await UsersService.getSystemStats();
            return res.status(200).json(stats);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List all users.
     */
    static async list(req, res, next) {
        try {
            const users = await UsersService.listUsers();
            return res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=users.controller.js.map