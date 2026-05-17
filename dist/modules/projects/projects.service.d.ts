/**
 * ProjectsService
 * Handles multi-tenant CRUD for Projects, Sections, and Assets.
 * All methods require a userId to ensure data isolation.
 */
export declare class ProjectsService {
    static listProjects(userId: string): Promise<({
        sections: ({
            assets: {
                type: string;
                id: string;
                order: number;
                titleEs: string | null;
                titleEn: string | null;
                descriptionEs: string | null;
                descriptionEn: string | null;
                sectionId: string;
                driveId: string;
                config3d: import("@prisma/client/runtime/client").JsonValue | null;
            }[];
        } & {
            projectId: string;
            id: string;
            order: number;
            layoutType: string;
            titleEs: string | null;
            titleEn: string | null;
            descriptionEs: string | null;
            descriptionEn: string | null;
            modelDriveId: string | null;
        })[];
    } & {
        id: string;
        userId: string;
        title: import("@prisma/client/runtime/client").JsonValue;
        description: import("@prisma/client/runtime/client").JsonValue | null;
        isPublished: boolean;
        slug: string;
        order: number;
        category: string | null;
        thumbnailDriveId: string | null;
        roleEs: string | null;
        roleEn: string | null;
    })[]>;
    static createProject(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        title: import("@prisma/client/runtime/client").JsonValue;
        description: import("@prisma/client/runtime/client").JsonValue | null;
        isPublished: boolean;
        slug: string;
        order: number;
        category: string | null;
        thumbnailDriveId: string | null;
        roleEs: string | null;
        roleEn: string | null;
    }>;
    static updateProject(userId: string, projectId: string, data: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static deleteProject(userId: string, projectId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static upsertSection(userId: string, data: any): Promise<{
        projectId: string;
        id: string;
        order: number;
        layoutType: string;
        titleEs: string | null;
        titleEn: string | null;
        descriptionEs: string | null;
        descriptionEn: string | null;
        modelDriveId: string | null;
    }>;
    static deleteSection(userId: string, sectionId: string): Promise<{
        projectId: string;
        id: string;
        order: number;
        layoutType: string;
        titleEs: string | null;
        titleEn: string | null;
        descriptionEs: string | null;
        descriptionEn: string | null;
        modelDriveId: string | null;
    }>;
    static upsertAsset(userId: string, data: any): Promise<{
        type: string;
        id: string;
        order: number;
        titleEs: string | null;
        titleEn: string | null;
        descriptionEs: string | null;
        descriptionEn: string | null;
        sectionId: string;
        driveId: string;
        config3d: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    static reorderItems(userId: string, type: 'project' | 'section' | 'asset', orders: {
        id: string;
        order: number;
    }[]): Promise<any[]>;
}
