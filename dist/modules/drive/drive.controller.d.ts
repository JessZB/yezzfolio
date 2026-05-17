import { Request, Response, NextFunction } from 'express';
/**
 * DriveController
 * Entry point for Google Drive interactions.
 */
export declare class DriveController {
    /**
     * Public Proxy for Google Drive files.
     * Automatically resolves the owner to use their specific OAuth tokens.
     */
    static proxy(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Private endpoint to check if the authenticated user owns a file.
     */
    static check(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Authenticated file upload.
     */
    static upload(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
