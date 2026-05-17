import { User } from '@prisma/client';
/**
 * AuthService
 * Encapsulates authentication logic, including Google token verification,
 * user status management, and session token generation.
 */
export declare class AuthService {
    /**
     * Verifies the Google ID Token provided by the client.
     */
    static verifyGoogleToken(idToken: string): Promise<import("google-auth-library").TokenPayload>;
    /**
     * Validates if a user is in the whitelist and handles the activation flow.
     */
    static validateAndActivateUser(payload: {
        email: string;
        sub: string;
        name?: string;
        picture?: string;
    }): Promise<User>;
    /**
     * Generates an internal JWT for application session management.
     */
    static generateSessionToken(user: User): string;
    /**
     * Generates the URL to request Google Drive access (personal OAuth).
     */
    static getDriveOAuthUrl(userId: string): string;
    /**
     * Exchanges the OAuth code for tokens and saves the encrypted refresh token.
     */
    static exchangeCodeForDriveTokens(code: string, userId: string): Promise<{
        success: boolean;
    }>;
}
