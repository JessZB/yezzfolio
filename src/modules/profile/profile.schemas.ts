import { z } from 'zod';

export const identitySchema = z.object({
  body: z.object({
    class_es: z.string().optional(),
    class_en: z.string().optional(),
    level: z.number().int().min(1).max(100).optional(),
    status_es: z.string().optional(),
    status_en: z.string().optional(),
    bio_es: z.string().optional(),
    bio_en: z.string().optional(),
    favicon_drive_id: z.string().optional(),
    avatar_drive_id: z.string().optional(),
    site_title_es: z.string().optional(),
    site_title_en: z.string().optional(),
    seo_desc_es: z.string().optional(),
    seo_desc_en: z.string().optional(),
    contact_title_es: z.string().optional(),
    contact_title_en: z.string().optional(),
    contact_desc_es: z.string().optional(),
    contact_desc_en: z.string().optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    theme_json: z.any().optional(),
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
