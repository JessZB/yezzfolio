import { z } from 'zod';
export declare const identitySchema: z.ZodObject<{
    body: z.ZodObject<{
        classEs: z.ZodOptional<z.ZodString>;
        classEn: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodNumber>;
        statusEs: z.ZodOptional<z.ZodString>;
        statusEn: z.ZodOptional<z.ZodString>;
        bioEs: z.ZodOptional<z.ZodString>;
        bioEn: z.ZodOptional<z.ZodString>;
        faviconDriveId: z.ZodOptional<z.ZodString>;
        avatarDriveId: z.ZodOptional<z.ZodString>;
        siteTitleEs: z.ZodOptional<z.ZodString>;
        siteTitleEn: z.ZodOptional<z.ZodString>;
        seoDescEs: z.ZodOptional<z.ZodString>;
        seoDescEn: z.ZodOptional<z.ZodString>;
        contactTitleEs: z.ZodOptional<z.ZodString>;
        contactTitleEn: z.ZodOptional<z.ZodString>;
        contactDescEs: z.ZodOptional<z.ZodString>;
        contactDescEn: z.ZodOptional<z.ZodString>;
        contactEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        themeJson: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const socialsSchema: z.ZodObject<{
    body: z.ZodObject<{
        socials: z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            link: z.ZodString;
            iconDriveId: z.ZodOptional<z.ZodString>;
            active: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const softwareSchema: z.ZodObject<{
    body: z.ZodObject<{
        software: z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            iconDriveId: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const statsSchema: z.ZodObject<{
    body: z.ZodObject<{
        stats: z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            nameEs: z.ZodString;
            nameEn: z.ZodString;
            value: z.ZodNumber;
            cssClass: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
