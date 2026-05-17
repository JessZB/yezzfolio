import { z } from 'zod';
export const identitySchema = z.object({
    body: z.object({
        classEs: z.string().optional(),
        classEn: z.string().optional(),
        level: z.number().int().min(1).max(100).optional(),
        statusEs: z.string().optional(),
        statusEn: z.string().optional(),
        bioEs: z.string().optional(),
        bioEn: z.string().optional(),
        faviconDriveId: z.string().optional(),
        avatarDriveId: z.string().optional(),
        siteTitleEs: z.string().optional(),
        siteTitleEn: z.string().optional(),
        seoDescEs: z.string().optional(),
        seoDescEn: z.string().optional(),
        contactTitleEs: z.string().optional(),
        contactTitleEn: z.string().optional(),
        contactDescEs: z.string().optional(),
        contactDescEn: z.string().optional(),
        contactEmail: z.string().email().optional().or(z.literal('')),
        themeJson: z.any().optional(),
    }),
});
export const socialsSchema = z.object({
    body: z.object({
        socials: z.array(z.object({
            id: z.string().optional(),
            name: z.string().min(1),
            link: z.string().url(),
            iconDriveId: z.string().optional(),
            active: z.boolean().optional(),
        })),
    }),
});
export const softwareSchema = z.object({
    body: z.object({
        software: z.array(z.object({
            id: z.string().optional(),
            name: z.string().min(1),
            iconDriveId: z.string().optional(),
            color: z.string().optional(),
        })),
    }),
});
export const statsSchema = z.object({
    body: z.object({
        stats: z.array(z.object({
            id: z.string().optional(),
            nameEs: z.string().min(1),
            nameEn: z.string().min(1),
            value: z.number().int(),
            cssClass: z.string().optional(),
        })),
    }),
});
//# sourceMappingURL=profile.schemas.js.map