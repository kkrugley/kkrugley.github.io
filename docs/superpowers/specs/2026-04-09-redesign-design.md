# Redesign: kkrugley.github.io → Astro + TypeScript + React

**Date:** 2026-04-09  
**Status:** Approved  

---

## Context

The site is a portfolio of industrial/product design work. Currently it's a vanilla HTML/CSS/JS site with no build tooling, MDX, or TypeScript. The goal is to refactor to a modern stack (Astro + TypeScript + React) while:
- Preserving the WEB1.0 aesthetic exactly (no visual changes to homepage and gallery index)
- Improving performance, reliability, and mobile UX
- Enabling content authoring via MDX files
- Adding: optional 3D model viewer, "Show all" button on gallery, structured portfolio template on project pages

All work happens in `/redesign/` subfolder. When complete, it replaces the root site.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Astro 4 | Native MDX, static output, React islands, GitHub Pages |
| Language | TypeScript | Type safety throughout |
| Interactive UI | React | Gallery lightbox, "show all" animation, 3D viewer |
| Content | MDX | Author project pages as structured markdown |
| 3D viewer | `<model-viewer>` | Google web component, GLB + USDZ, zero config |
| Styling | CSS (no framework) | Preserve existing WEB1.0 aesthetic |

---

## Directory Structure

```
redesign/
├── src/
│   ├── content/
│   │   └── projects/
│   │       └── coffee-stool/
│   │           ├── index.mdx          # project content
│   │           ├── img/               # all project images
│   │           └── model.glb          # 3D model (optional)
│   ├── components/
│   │   ├── Gallery.tsx                # image gallery + lightbox (React island)
│   │   ├── GalleryGrid.tsx            # random cards + "show all" (React island)
│   │   └── ModelViewer.tsx            # <model-viewer> wrapper (React island)
│   ├── layouts/
│   │   ├── BaseLayout.astro           # <head>, fonts, meta
│   │   ├── ProjectLayout.astro        # project page shell
│   │   └── GalleryLayout.astro        # gallery index shell
│   └── pages/
│       ├── index.astro                # homepage (Clippy, card)
│       └── gallery/
│           ├── index.astro            # gallery page
│           └── [slug].astro           # dynamic project pages
├── public/
│   └── assets/
│       ├── fonts/                     # TimesNewArialVF.woff2
│       ├── img/                       # clippy.gif, fav.svg, social.jpg
│       └── background_generator/      # preserved as-is
└── astro.config.ts
```

---

## MDX Schema (Content Collections)

Every project is a folder inside `src/content/projects/`. The frontmatter schema:

```ts
// src/content/config.ts
const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    year: z.number().optional(),
    tags: z.array(z.string()).default([]),
    thumbnail: z.string(),            // path to card thumbnail image
    links: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
    })).default([]),
    model3d: z.string().optional(),   // path to .glb file
    model3d_ios: z.string().optional(), // path to .usdz file (optional)

    // Portfolio template toggle
    useTemplate: z.boolean().default(true),

    // Template sections (all optional — only used when useTemplate: true)
    hero: z.string().optional(),
    problem: z.object({ text: z.string(), image: z.string().optional() }).optional(),
    solution: z.object({ text: z.string(), image: z.string().optional() }).optional(),
    process: z.array(z.string()).optional(),   // up to 3 image paths
    details: z.object({ text: z.string(), image: z.string().optional() }).optional(),
    final: z.object({
      main: z.string().optional(),
      detail: z.string().optional(),
      context: z.string().optional(),
    }).optional(),

    // Legacy mode: free-form description (used when useTemplate: false)
    description: z.string().optional(),
    gallery: z.array(z.string()).default([]),  // image paths for the top gallery slider
  }),
});
```

### Example: new project (useTemplate: true)

```mdx
---
title: Coffee Stool
tagline: A minimal stool designed for small urban kitchens
year: 2025
tags: [Product Design, Concept → Prototype]
thumbnail: ./img/cover.jpg
links:
  - label: Behance
    url: https://behance.net/gallery/...
  - label: ArtStation
    url: https://www.artstation.com/...
model3d: ./model.glb
gallery:
  - ./img/1.jpg
  - ./img/2.jpg
  - ./img/3.jpg
useTemplate: true
hero: ./img/hero.jpg
problem:
  text: Описание проблемы...
  image: ./img/problem.jpg
solution:
  text: Описание решения...
  image: ./img/solution.jpg
process:
  - ./img/sketches.jpg
  - ./img/variants.jpg
  - ./img/chosen.jpg
details:
  text: Ключевые решения по материалам, эргономике, механизму...
  image: ./img/exploded.jpg
final:
  main: ./img/final-main.jpg
  detail: ./img/final-detail.jpg
  context: ./img/final-context.jpg
---
```

### Example: legacy project (useTemplate: false)

```mdx
---
title: Gamine Render
tagline: CGI product visualization study
year: 2024
tags: [3D, CGI]
thumbnail: ./img/cover.jpg
links:
  - label: Behance
    url: https://behance.net/gallery/...
gallery:
  - ./img/1.jpg
  - ./img/2.jpg
  - ./img/3.jpg
useTemplate: false
description: |
  Free-form description text here.
  Can include multiple paragraphs.
---
```

---

## Page Designs

### Homepage (`/`)
Pixel-identical to current `index.html`. Clippy animation logic ported to `browser.js` preserved as a script in `public/`. No visual changes.

### Gallery Index (`/gallery/`)
Pixel-identical to current gallery. `GalleryGrid.tsx` React island replaces `random-card.js`:
- On load: random subset of cards (configurable, default 8), scattered with random rotation/position — identical to current behaviour
- **"Show all" button**: placed in the navigation row next to `[Refresh]`, styled as a bracket link `[Show All]` to match WEB1.0 aesthetic
- On click: all cards animate into a clean CSS grid (no more absolute positioning). Cards not in the initial random set fade in. Animation: CSS transitions, ~300ms, ease-out.
- If total projects > 8, the extra cards appear during the "show all" animation

### Project Pages (`/gallery/[slug]`)
Layout (max-width: 960px, centered):

```
┌──────────────────────────────────────────────┐
│  h1: Project Title                           │
│  [← Back]  [E-mail Me]                       │
│                                              │
│         [ main image — centered ]            │
│         [ thumb ] [ thumb ] [ thumb ]        │  ← centered
│                                              │
├──────────────────────────────────────────────│
│  Links (20%)     │  Content (80%)            │
│  → Behance       │                           │
│  → ArtStation    │  [IF useTemplate: true]   │
│  ─────────────   │  Case Study tags          │
│  → View 3D Model │  Title / Tagline          │
│  (link, not btn) │  Hero image               │
│                  │  01 Problem | 02 Solution │
│                  │  03 Process (3-col imgs)  │
│                  │  04 Details (text + img)  │
│                  │  05 Final (3fr + 2fr)     │
│                  │                           │
│                  │  [IF useTemplate: false]  │
│                  │  free text + images       │
└──────────────────────────────────────────────┘
```

### 3D Model Viewer
- "View 3D Model" link appears in the Links sidebar only if `model3d` is set in frontmatter
- Click opens a full-screen overlay with `<model-viewer>` (auto-rotate, camera controls)
- GLB loaded, USDZ passed as `ios-src` attribute for native iOS AR
- Overlay closeable via Escape or click outside

---

## "Show All" Animation Detail

```
State 1 (default):     State 2 (show all):
  ╭──╮                 ┌──┬──┬──┬──┐
    ╭──╮               │  │  │  │  │
  ╭────╮               ├──┼──┼──┼──┤
      ╭──╮             │  │  │  │  │
                       └──┴──┴──┴──┘
  scattered            neat grid (all projects)
```

Implementation: React state toggle using FLIP animation (First → Last → Invert → Play). CSS `transition` cannot animate between `position: absolute` and `display: grid`, so:
1. Record each card's current `getBoundingClientRect()` (First)
2. Switch container to `display: grid` (Last)
3. For each card, apply `transform: translate(dx, dy)` to snap it back to original position (Invert)
4. Remove transforms in the next frame so CSS transition animates them to grid position (Play)
5. New cards (not in initial random set) appear with `opacity: 0 → 1`, `transform: scale(0.95 → 1)`, 300ms delay

---

## Migration Strategy

All 12 existing projects are migrated to MDX. Initially all use `useTemplate: false` + their existing description text and images. Template adoption is done per-project by:
1. Changing `useTemplate: true`
2. Adding the template section fields to frontmatter
3. Organizing images into the appropriate roles

---

## Responsive / Mobile

- Homepage: identical to current (card rotates 95deg on portrait)
- Gallery: scattered cards → on mobile, show a simple scrollable grid by default (random scatter works poorly on small screens). "Show all" same behaviour.
- Project pages: below 768px — two columns stack vertically (sidebar on top, content below). Gallery thumbnails scroll horizontally if many.

---

## Verification

1. `cd redesign && npm run dev` → all three page types render correctly
2. Homepage: Clippy appears after 1.5s, tooltip after 2.5s
3. Gallery: 8 random cards on load, `[Show All]` triggers animation showing all projects
4. Project page (template): all 5 sections render from frontmatter
5. Project page (legacy): description renders as free text
6. 3D viewer: clicking link opens fullscreen overlay, model is interactive
7. `npm run build` → no TypeScript errors, static output in `dist/`
8. Deploy `dist/` to GitHub Pages root → site works at `kkrugley.github.io`
