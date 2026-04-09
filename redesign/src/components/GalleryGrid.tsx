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

function getScatterPosition(containerW: number, containerH: number, cardW = 200, cardH = 220) {
  return {
    left: Math.random() * Math.max(0, containerW - cardW),
    top: Math.random() * Math.max(0, containerH - cardH),
  };
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

    const container = containerRef.current;
    if (!container) return;

    let { width, height } = container.getBoundingClientRect();

    // If layout hasn't painted yet, fallback to viewport dimensions
    if (width === 0 || height === 0) {
      width = window.innerWidth;
      height = window.innerHeight - 80;
    }

    const posMap = new Map<string, { left: number; top: number; rotation: number }>();
    initial.forEach(p => {
      posMap.set(p.slug, { ...getScatterPosition(width, height), rotation: getRandomRotation() });
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
      // FLIP: apply Invert transforms to snap existing cards back to First position
      cardRefs.current.forEach((el, slug) => {
        if (incoming.has(slug)) return;
        const first = rects.get(slug);
        if (!first) return;
        const last = el.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = 'none';
      });

      requestAnimationFrame(() => {
        // FLIP: Play — animate from inverted position to natural grid position
        cardRefs.current.forEach((el, slug) => {
          if (incoming.has(slug)) return;
          el.style.transition = 'transform 300ms ease-out';
          el.style.transform = '';
        });

        // Fade in new cards shortly after
        setTimeout(() => {
          setEnteredSlugs(incoming);
        }, 50);
      });
    });
  }, [projects, visibleSlugs]);

  useEffect(() => {
    const handler = () => handleShowAll();
    window.addEventListener('gallery:showAll', handler);
    return () => window.removeEventListener('gallery:showAll', handler);
  }, [handleShowAll]);

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
