import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { env } from '../../config/env.js';

/**
 * AuthController
 * Handles Google OAuth logic and internal JWT generation.
 * Acts as the entry point for HTTP requests, delegating logic to AuthService.
 */
export class AuthController {
  /**
   * Google Login Flow:
   * 1. Receive Google ID Token from frontend.
   * 2. Delegate verification and activation to AuthService.
   * 3. Return session JWT and user data.
   */
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'Google ID Token is required',
      });
    }

    try {
      // 1. Verify and Activate
      const payload = await AuthService.verifyGoogleToken(idToken);
      const user = await AuthService.validateAndActivateUser({
        email: payload.email!,
        sub: payload.sub,
        name: payload.name,
        picture: payload.picture,
      });

      // 2. Generate Session Token
      const token = AuthService.generateSessionToken(user);

      // 3. Response
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          avatar: user.avatar,
        },
      });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(403).json({ error: 'No estás en la lista de invitados.' });
      }
      if (error.message === 'USER_SUSPENDED') {
        return res.status(403).json({ error: 'Tu cuenta ha sido suspendida.' });
      }
      if (error.message === 'INVALID_TOKEN') {
        return res.status(400).json({ error: 'Token de Google inválido.' });
      }
      
      next(error); // Pass to global error handler
    }
  }

  /**
   * Generates the Google Drive connection URL.
   */
  static async connectDrive(req: Request, res: Response, next: NextFunction) {
    try {
      const url = AuthService.getDriveOAuthUrl(req.user!.id);
      return res.status(200).json({ url });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the Google OAuth callback and saves the tokens.
   */
  static async driveCallback(req: Request, res: Response, next: NextFunction) {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    try {
      await AuthService.exchangeCodeForDriveTokens(code as string, state as string);
      
      // Redirect back to Admin UI
      const redirectUrl = `${env.ADMIN_UI_URL}/admin/settings`;
      return res.redirect(`${redirectUrl}?status=drive_connected`);
    } catch (error) {
      next(error);
    }
  }
}
