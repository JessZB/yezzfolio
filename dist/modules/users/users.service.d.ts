import { Role } from '@prisma/client';
/**
 * UsersService
 * Handles business logic for user management, including invitations and system statistics.
 */
export declare class UsersService {
    /**
     * Invites a new user by adding them to the whitelist with a PENDING_INVITE status.
     */
    static inviteUser(email: string, role?: Role): Promise<{
        id: string;
        email: string;
        name: string | null;
        googleId: string | null;
        googleUserId: string | null;
        refreshToken: string | null;
        preferredLang: string;
        driveRootFolderId: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Fetches global system statistics.
     */
    static getSystemStats(): Promise<{
        users: {
            total: number;
            active: number;
            pending: number;
        };
        projects: {
            total: number;
            published: number;
        };
    }>;
    /**
     * Lists all users in the system with their project counts.
     */
    static listUsers(): Promise<({
        _count: {
            projects: number;
        };
    } & {
        id: string;
        email: string;
        name: string | null;
        googleId: string | null;
        googleUserId: string | null;
        refreshToken: string | null;
        preferredLang: string;
        driveRootFolderId: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.Status;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
