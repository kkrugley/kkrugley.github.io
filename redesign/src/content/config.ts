// redesign/src/content/config.ts
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
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
    hero: z.string().optional(),
    problem: z.object({ text: z.string(), image: z.string().optional() }).optional(),
    solution: z.object({ text: z.string(), image: z.string().optional() }).optional(),
    process: z.array(z.string()).optional(),
    details: z.object({ text: z.string(), image: z.string().optional() }).optional(),
    final: z.object({
      main: z.string().optional(),
      detail: z.string().optional(),
      context: z.string().optional(),
    }).optional(),
    description: z.string().optional(),
    gallery: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
