import { Request, Response } from 'express';

/**
 * Formats a successful API response.
 */
export const success = (res: Response, data: any, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

/**
 * Formats an error API response.
 */
export const error = (res: Response, message: string, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, error: message });
};
