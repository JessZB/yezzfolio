/**
 * ProfileService
 * Handles artist identity, profile metadata, and associated lists (socials, software, stats).
 */
export declare class ProfileService {
    /**
     * Retrieves the full profile including all associated relations.
     */
    static getFullProfile(userId: string): Promise<{
        profile: {};
        socials: {
            id: string;
            name: string;
            link: string;
            userId: string;
            order: number;
            iconDriveId: string | null;
            active: boolean;
        }[];
        software: {
            id: string;
            name: string;
            userId: string;
            order: number;
            iconDriveId: string | null;
            color: string | null;
        }[];
        stats: {
            id: string;
            userId: string;
            value: number;
            order: number;
            nameEs: string;
            nameEn: string;
            cssClass: string | null;
        }[];
    }>;
    /**
     * Updates or creates the main identity profile.
     */
    static upsertIdentity(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        classEs: string | null;
        classEn: string | null;
        level: number;
        statusEs: string | null;
        statusEn: string | null;
        bioEs: string | null;
        bioEn: string | null;
        faviconDriveId: string | null;
        avatarDriveId: string | null;
        siteTitleEs: string | null;
        siteTitleEn: string | null;
        seoDescEs: string | null;
        seoDescEn: string | null;
        contactTitleEs: string | null;
        contactTitleEn: string | null;
        contactDescEs: string | null;
        contactDescEn: string | null;
        contactEmail: string | null;
        themeJson: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    /**
     * Replaces all social links for a user (Transactional).
     */
    static updateSocials(userId: string, socials: any[]): Promise<[import("@prisma/client").Prisma.BatchPayload, import("@prisma/client").Prisma.BatchPayload]>;
    /**
     * Replaces all software items (Transactional).
     */
    static updateSoftware(userId: string, software: any[]): Promise<[import("@prisma/client").Prisma.BatchPayload, import("@prisma/client").Prisma.BatchPayload]>;
    /**
     * Replaces all stats (Transactional).
     */
    static updateStats(userId: string, stats: any[]): Promise<[import("@prisma/client").Prisma.BatchPayload, import("@prisma/client").Prisma.BatchPayload]>;
}
