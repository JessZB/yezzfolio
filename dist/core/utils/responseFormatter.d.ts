import { Response } from 'express';
/**
 * Formats a successful API response.
 */
export declare const success: (res: Response, data: any, statusCode?: number) => Response<any, Record<string, any>>;
/**
 * Formats an error API response.
 */
export declare const error: (res: Response, message: string, statusCode?: number) => Response<any, Record<string, any>>;
