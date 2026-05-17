import { z } from 'zod';
export declare const inviteUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            SUPER_ADMIN: "SUPER_ADMIN";
            ARTIST: "ARTIST";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
