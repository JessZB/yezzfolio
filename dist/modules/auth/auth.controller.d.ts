import { Request, Response, NextFunction } from 'express';
/**
 * AuthController
 * Handles Google OAuth logic and internal JWT generation.
 * Acts as the entry point for HTTP requests, delegating logic to AuthService.
 */
export declare class AuthController {
    /**
     * Google Login Flow:
     * 1. Receive Google ID Token from frontend.
     * 2. Delegate verification and activation to AuthService.
     * 3. Return session JWT and user data.
     */
    static googleLogin(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Generates the Google Drive connection URL.
     */
    static connectDrive(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Handles the Google OAuth callback and saves the tokens.
     */
    static driveCallback(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
