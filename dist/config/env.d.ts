import { z } from 'zod';
import 'dotenv/config';
declare const envSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    GOOGLE_CLIENT_ID: z.ZodString;
    GOOGLE_CLIENT_SECRET: z.ZodString;
    GOOGLE_REDIRECT_URI: z.ZodString;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    PROXY_BASE_URL: z.ZodOptional<z.ZodString>;
    ASTRO_WEBHOOK_URL: z.ZodOptional<z.ZodString>;
    ADMIN_UI_URL: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const env: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    PORT: number;
    ADMIN_UI_URL: string;
    PROXY_BASE_URL?: string | undefined;
    ASTRO_WEBHOOK_URL?: string | undefined;
};
export type Env = z.infer<typeof envSchema>;
export {};
