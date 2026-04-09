import { describe, it, expect } from 'vitest';

function getRandomSubset<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function getRandomRotation(min = -45, max = 45): number {
  return Math.random() * (max - min) + min;
}

describe('GalleryGrid utilities', () => {
  const projects = Array.from({ length: 12 }, (_, i) => ({
    slug: `p${i}`,
    title: `Project ${i}`,
    thumbnail: `/img/${i}.jpg`,
  }));

  it('getRandomSubset returns correct count', () => {
    const subset = getRandomSubset(projects, 8);
    expect(subset).toHaveLength(8);
  });

  it('getRandomSubset does not return duplicates', () => {
    const subset = getRandomSubset(projects, 8);
    const slugs = subset.map(p => p.slug);
    expect(new Set(slugs).size).toBe(8);
  });

  it('getRandomSubset handles count > array length', () => {
    const subset = getRandomSubset(projects, 20);
    expect(subset).toHaveLength(12);
  });

  it('getRandomRotation returns value in range', () => {
    for (let i = 0; i < 100; i++) {
      const r = getRandomRotation(-45, 45);
      expect(r).toBeGreaterThanOrEqual(-45);
      expect(r).toBeLessThanOrEqual(45);
    }
  });
});
