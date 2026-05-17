import { Request, Response, NextFunction } from 'express';
/**
 * UsersController
 * Entry point for user-related HTTP requests.
 * Delegating logic to UsersService.
 */
export declare class UsersController {
    /**
     * Invite a new artist to the platform.
     */
    static invite(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get global stats for the super admin dashboard.
     */
    static getStats(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * List all users.
     */
    static list(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
