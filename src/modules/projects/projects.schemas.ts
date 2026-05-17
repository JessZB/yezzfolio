import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    slug: z.string().min(1, 'Slug is required'),
    title_es: z.string().optional(),
    title_en: z.string().optional(),
    description_es: z.string().optional(),
    description_en: z.string().optional(),
    order: z.number().optional(),
    category: z.string().optional(),
    thumbnail_drive_id: z.string().optional(),
    role_es: z.string().optional(),
    role_en: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    slug: z.string().optional(),
    title_es: z.string().optional(),
    title_en: z.string().optional(),
    description_es: z.string().optional(),
    description_en: z.string().optional(),
    order: z.number().optional(),
    is_published: z.boolean().optional(),
    category: z.string().optional(),
    thumbnail_drive_id: z.string().optional(),
    role_es: z.string().optional(),
    role_en: z.string().optional(),
  }),
});

export const upsertSectionSchema = z.object({
  body: z.object({
    id: z.string().uuid().optional(),
    project_id: z.string().uuid(),
    layout_type: z.string().min(1),
    order: z.number().optional(),
    title_es: z.string().optional().nullable(),
    title_en: z.string().optional().nullable(),
    description_es: z.string().optional().nullable(),
    description_en: z.string().optional().nullable(),
    model_drive_id: z.string().optional().nullable(),
  }),
});

export const upsertAssetSchema = z.object({
  body: z.object({
    id: z.string().uuid().optional(),
    section_id: z.string().uuid(),
    drive_id: z.string().optional().nullable(),
    type: z.string().min(1),
    order: z.number().optional(),
    config_3d: z.any().optional(),
    title_es: z.string().optional().nullable(),
    title_en: z.string().optional().nullable(),
    description_es: z.string().optional().nullable(),
    description_en: z.string().optional().nullable(),
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
