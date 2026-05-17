import { z } from 'zod';
export const createProjectSchema = z.object({
    body: z.object({
        slug: z.string().min(1, 'Slug is required'),
        title: z.any().optional(),
        description: z.any().optional(),
        order: z.number().optional(),
    }),
});
export const updateProjectSchema = z.object({
    body: z.object({
        slug: z.string().optional(),
        title: z.any().optional(),
        description: z.any().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
    }),
});
export const upsertSectionSchema = z.object({
    body: z.object({
        id: z.string().uuid().optional(),
        projectId: z.string().uuid(),
        layoutType: z.string().min(1),
        order: z.number().optional(),
    }),
});
export const upsertAssetSchema = z.object({
    body: z.object({
        id: z.string().uuid().optional(),
        sectionId: z.string().uuid(),
        driveId: z.string().min(1),
        type: z.string().min(1),
        order: z.number().optional(),
        config3d: z.any().optional(),
    }),
});
export const reorderSchema = z.object({
    body: z.object({
        type: z.enum(['project', 'section', 'asset']),
        orders: z.array(z.object({
            id: z.string().uuid(),
            order: z.number()
        })),
    }),
});
//# sourceMappingURL=projects.schemas.js.map