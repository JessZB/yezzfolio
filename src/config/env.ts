import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  PROXY_BASE_URL: z.string().optional(),
  ASTRO_WEBHOOK_URL: z.string().optional(),
  ADMIN_UI_URL: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
