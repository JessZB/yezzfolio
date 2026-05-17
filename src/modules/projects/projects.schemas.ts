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
    is_published: z.boolean().optional(),
  }),
});

export const upsertSectionSchema = z.object({
  body: z.object({
    id: z.string().uuid().optional(),
    project_id: z.string().uuid(),
    layout_type: z.string().min(1),
    order: z.number().optional(),
  }),
});

export const upsertAssetSchema = z.object({
  body: z.object({
    id: z.string().uuid().optional(),
    section_id: z.string().uuid(),
    drive_id: z.string().min(1),
    type: z.string().min(1),
    order: z.number().optional(),
    config_3d: z.any().optional(),
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
