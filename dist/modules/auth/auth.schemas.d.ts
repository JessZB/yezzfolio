import { z } from 'zod';
export declare const googleLoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        idToken: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
