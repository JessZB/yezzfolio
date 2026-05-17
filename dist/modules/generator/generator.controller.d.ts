import { Request, Response, NextFunction } from 'express';
/**
 * GeneratorController
 * Entry point for triggering SSG builds.
 */
export declare class GeneratorController {
    static build(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
