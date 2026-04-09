import { useState, useEffect, useRef, useCallback } from 'react';

export interface ProjectCard {
  slug: string;
  title: string;
  thumbnail: string;
}

interface Props {
  projects: ProjectCard[];
  initialCount?: number;
}

function getRandomSubset<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function getRandomRotation(): number {
  return Math.random() * 90 - 45;
}

// Zone-based scatter: divides screen into a grid, places one card per zone.
// Returns positions for `count` cards, ensuring even coverage of the full screen.
function getZonedScatterPositions(count: number, containerW: number, containerH: number, cardW = 180, cardH = 220): Array<{ left: number; top: number }> {
  const cols = 4;
  const rows = Math.ceil(count / cols);
  const zoneW = containerW / cols;
  const zoneH = containerH / rows;

  // Build all zones, shuffle, take `count`
  const zones: { col: number; row: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      zones.push({ col: c, row: r });
    }
  }
  const shuffled = zones.sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map(({ col, row }) => ({
    left: col * zoneW + Math.random() * Math.max(0, zoneW - cardW),
    top: row * zoneH + Math.random() * Math.max(0, zoneH - cardH),
  }));
}

export default function GalleryGrid({ projects, initialCount = 8 }: Props) {
  const [isGrid, setIsGrid] = useState(false);
  const [visibleSlugs, setVisibleSlugs] = useState<Set<string>>(new Set());
  const [newSlugs, setNewSlugs] = useState<Set<string>>(new Set());
  const [enteredSlugs, setEnteredSlugs] = useState<Set<string>>(new Set());
  const [positions, setPositions] = useState<Map<string, { left: number; top: number; rotation: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Initialize scattered layout
  useEffect(() => {
    const initial = getRandomSubset(projects, initialCount);
    const initialSet = new Set(initial.map(p => p.slug));
    setVisibleSlugs(initialSet);

    const w = window.innerWidth;
    const h = window.innerHeight;

    const zonedPositions = getZonedScatterPositions(initial.length, w, h);
    const posMap = new Map<string, { left: number; top: number; rotation: number }>();
    initial.forEach((p, i) => {
      posMap.set(p.slug, { ...zonedPositions[i], rotation: getRandomRotation() });
    });
    setPositions(posMap);
  }, [projects, initialCount]);

  // Listen for show-all trigger from the Astro page
  const handleShowAll = useCallback(() => {
    // FLIP: record First positions of currently visible cards
    const rects = new Map<string, DOMRect>();
    cardRefs.current.forEach((el, slug) => {
      rects.set(slug, el.getBoundingClientRect());
    });

    const allSlugs = new Set(projects.map(p => p.slug));
    const incoming = new Set([...allSlugs].filter(s => !visibleSlugs.has(s)));
    setNewSlugs(incoming);
    setVisibleSlugs(allSlugs);
    setIsGrid(true);

    requestAnimationFrame(() => {
      // FLIP: apply Invert — snap each card back to its scattered position + rotation
      const existingEntries = [...cardRefs.current.entries()].filter(([slug]) => !incoming.has(slug));
      existingEntries.forEach(([slug, el]) => {
        const first = rects.get(slug);
        if (!first) return;
        const last = el.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        const rotation = positions.get(slug)?.rotation ?? 0;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
        el.style.transition = 'none';
      });

      requestAnimationFrame(() => {
        // FLIP: Play — slide + straighten into grid position with stagger
        existingEntries.forEach(([slug, el], index) => {
          if (!rects.get(slug)) return;
          const delay = index * 25;
          el.style.transition = `transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;
          el.style.transform = '';
        });

        // Fade in new cards shortly after
        setTimeout(() => {
          setEnteredSlugs(incoming);
        }, 50);
      });
    });
  }, [projects, visibleSlugs, positions]);

  useEffect(() => {
    const handler = () => handleShowAll();
    window.addEventListener('gallery:showAll', handler);
    return () => window.removeEventListener('gallery:showAll', handler);
  }, [handleShowAll]);

  // Listen for scatter — pick new random subset, return to scattered state
  const handleScatter = useCallback(() => {
    const next = getRandomSubset(projects, initialCount);
    const nextSet = new Set(next.map(p => p.slug));
    setIsGrid(false);
    setNewSlugs(new Set());
    setEnteredSlugs(new Set());
    setVisibleSlugs(nextSet);
    setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const zonedPositions = getZonedScatterPositions(next.length, w, h);
      const posMap = new Map<string, { left: number; top: number; rotation: number }>();
      next.forEach((p, i) => {
        posMap.set(p.slug, { ...zonedPositions[i], rotation: getRandomRotation() });
      });
      setPositions(posMap);
    }, 0);
  }, [projects, initialCount]);

  useEffect(() => {
    window.addEventListener('gallery:scatter', handleScatter);
    return () => window.removeEventListener('gallery:scatter', handleScatter);
  }, [handleScatter]);

  // Listen for refresh — pick new random subset, return to scattered state
  useEffect(() => {
    const handler = () => {
      const next = getRandomSubset(projects, initialCount);
      const nextSet = new Set(next.map(p => p.slug));
      setIsGrid(false);
      setNewSlugs(new Set());
      setEnteredSlugs(new Set());
      setVisibleSlugs(nextSet);
      setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const zonedPositions = getZonedScatterPositions(next.length, w, h);
        const posMap = new Map<string, { left: number; top: number; rotation: number }>();
        next.forEach((p, i) => {
          posMap.set(p.slug, { ...zonedPositions[i], rotation: getRandomRotation() });
        });
        setPositions(posMap);
      }, 0);
    };
    window.addEventListener('gallery:refresh', handler);
    return () => window.removeEventListener('gallery:refresh', handler);
  }, [projects, initialCount]);

  const visibleProjects = projects.filter(p => visibleSlugs.has(p.slug));

  if (!isGrid) {
    return (
      <div ref={containerRef} className="gallery-scattered" aria-label="Gallery">
        {visibleProjects.map(p => {
          const pos = positions.get(p.slug);
          return (
            <div
              key={p.slug}
              ref={el => { if (el) cardRefs.current.set(p.slug, el); }}
              className="gallery-card"
              style={{
                left: pos ? `${pos.left}px` : '0',
                top: pos ? `${pos.top}px` : '0',
                transform: pos ? `rotate(${pos.rotation}deg)` : undefined,
              }}
            >
              <a href={`/gallery/${p.slug}/`}>
                <img src={p.thumbnail} alt={p.title} loading="lazy" />
              </a>
              <br />
              <a href={`/gallery/${p.slug}/`}>{p.title}</a>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="gallery-grid" aria-label="All projects">
      {visibleProjects.map(p => {
        const isNew = newSlugs.has(p.slug);
        const hasEntered = enteredSlugs.has(p.slug);
        return (
          <div
            key={p.slug}
            ref={el => { if (el) cardRefs.current.set(p.slug, el); }}
            className={`gallery-card${isNew ? (hasEntered ? ' entered' : ' entering') : ''}`}
          >
            <a href={`/gallery/${p.slug}/`}>
              <img src={p.thumbnail} alt={p.title} loading="lazy" />
            </a>
            <br />
            <a href={`/gallery/${p.slug}/`}>{p.title}</a>
          </div>
        );
      })}
    </div>
  );
}
