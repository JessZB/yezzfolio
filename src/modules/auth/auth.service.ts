import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Status, User } from '@prisma/client';
import prisma from '../../core/db.js';
import { env } from '../../config/env.js';
import { encrypt } from '../../core/utils/encrypt.js';

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

/**
 * AuthService
 * Encapsulates authentication logic, including Google token verification,
 * user status management, and session token generation.
 */
export class AuthService {
  /**
   * Verifies the Google ID Token provided by the client.
   */
  static async verifyGoogleToken(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('INVALID_TOKEN');
    }

    return payload;
  }

  /**
   * Validates if a user is in the whitelist and handles the activation flow.
   */
  static async validateAndActivateUser(payload: { 
    email: string; 
    sub: string; 
    name?: string; 
    picture?: string 
  }): Promise<User> {
    const { email, sub: googleId, name, picture: avatar } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.status === Status.SUSPENDED) {
      throw new Error('USER_SUSPENDED');
    }

    if (user.status === Status.PENDING_INVITE) {
      user = await prisma.user.update({
        where: { email },
        data: {
          googleId,
          name: user.name || name,
          avatar: user.avatar || avatar,
          status: Status.ACTIVE,
        },
      });
    }

    return user;
  }

  /**
   * Generates an internal JWT for application session management.
   */
  static generateSessionToken(user: User): string {
    return jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Generates the URL to request Google Drive access (personal OAuth).
   */
  static getDriveOAuthUrl(userId: string): string {
    // Sign userId into a short-lived JWT for CSRF-protected state
    const state = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '10m' });
    
    return googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
      prompt: 'consent',
      state,
    });
  }

  /**
   * Exchanges the OAuth code for tokens and saves the encrypted refresh token.
   */
  static async exchangeCodeForDriveTokens(code: string, state: string) {
    // Verify the CSRF-protected state token to extract userId
    let userId: string;
    try {
      const decoded = jwt.verify(state, env.JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      throw new Error('INVALID_STATE');
    }

    const { tokens } = await googleClient.getToken(code);
    
    if (!tokens.refresh_token) {
      // Note: refresh_token is only sent the first time user consents
      // unless prompt=consent is used.
      throw new Error('NO_REFRESH_TOKEN');
    }

    const encryptedToken = encrypt(tokens.refresh_token);

    // Get the user's Google Permission ID for ownership checks
    // We can use the openid info from tokens if available or a separate call
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const googleUserId = ticket.getPayload()?.sub;

    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: encryptedToken,
        googleUserId: googleUserId
      },
    });

    return { success: true };
  }
}
