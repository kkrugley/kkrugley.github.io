// redesign/tests/schema.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string(),
  tagline: z.string().optional(),
  year: z.number().optional(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
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
});

describe('Project schema', () => {
  it('accepts minimal valid project (legacy)', () => {
    const result = projectSchema.safeParse({
      title: 'Test Project',
      thumbnail: '/gallery/test/img/cover.jpg',
      useTemplate: false,
      description: 'Some text',
    });
    expect(result.success).toBe(true);
    expect(result.data?.useTemplate).toBe(false);
    expect(result.data?.gallery).toEqual([]);
  });

  it('defaults useTemplate to true', () => {
    const result = projectSchema.safeParse({
      title: 'Test Project',
      thumbnail: '/gallery/test/img/cover.jpg',
    });
    expect(result.success).toBe(true);
    expect(result.data?.useTemplate).toBe(true);
  });

  it('accepts full template project', () => {
    const result = projectSchema.safeParse({
      title: 'Coffee Stool',
      tagline: 'A minimal stool',
      year: 2025,
      tags: ['Product Design'],
      thumbnail: '/gallery/coffee-stool/img/cover.jpg',
      links: [{ label: 'Behance', url: 'https://behance.net/gallery/1' }],
      model3d: '/assets/3d_assets/stool-rebuild.glb',
      useTemplate: true,
      hero: '/gallery/coffee-stool/img/hero.jpg',
      problem: { text: 'Problem text', image: '/gallery/coffee-stool/img/p.jpg' },
      solution: { text: 'Solution text' },
      process: ['/gallery/coffee-stool/img/1.jpg'],
      details: { text: 'Details text' },
      final: { main: '/gallery/coffee-stool/img/final.jpg' },
      gallery: ['/gallery/coffee-stool/img/1.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects project without title', () => {
    const result = projectSchema.safeParse({ thumbnail: '/img/cover.jpg' });
    expect(result.success).toBe(false);
  });

  it('rejects project without thumbnail', () => {
    const result = projectSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });
});
