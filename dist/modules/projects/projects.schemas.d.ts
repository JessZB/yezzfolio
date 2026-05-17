import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    body: z.ZodObject<{
        slug: z.ZodString;
        title: z.ZodOptional<z.ZodAny>;
        description: z.ZodOptional<z.ZodAny>;
        order: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    body: z.ZodObject<{
        slug: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodAny>;
        description: z.ZodOptional<z.ZodAny>;
        order: z.ZodOptional<z.ZodNumber>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const upsertSectionSchema: z.ZodObject<{
    body: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        projectId: z.ZodString;
        layoutType: z.ZodString;
        order: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const upsertAssetSchema: z.ZodObject<{
    body: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        sectionId: z.ZodString;
        driveId: z.ZodString;
        type: z.ZodString;
        order: z.ZodOptional<z.ZodNumber>;
        config3d: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const reorderSchema: z.ZodObject<{
    body: z.ZodObject<{
        type: z.ZodEnum<{
            project: "project";
            section: "section";
            asset: "asset";
        }>;
        orders: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            order: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
