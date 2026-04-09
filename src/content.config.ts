// redesign/src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Media slot: string (simple image path) or typed object for SVG/PNG/3D
const mediaSlot = z.union([
  z.string(),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string().optional() }),
  z.object({ type: z.literal('model3d'), src: z.string(), iosSrc: z.string().optional(), alt: z.string().optional() }),
]);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    year: z.number().optional(),
    tags: z.array(z.string()).default([]),
    thumbnail: z.string(),
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
    })).default([]),
    model3d: z.string().optional(),
    model3d_ios: z.string().optional(),
    useTemplate: z.boolean().default(true),
    hero: mediaSlot.optional(),
    problem: z.object({ text: z.string(), image: mediaSlot.optional() }).optional(),
    solution: z.object({ text: z.string(), image: mediaSlot.optional() }).optional(),
    process: z.array(mediaSlot).optional(),
    details: z.object({ text: z.string(), image: mediaSlot.optional() }).optional(),
    final: z.object({
      main: mediaSlot.optional(),
      detail: mediaSlot.optional(),
      context: mediaSlot.optional(),
    }).optional(),
    description: z.string().optional(),
    gallery: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
