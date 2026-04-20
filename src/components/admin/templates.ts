export type TemplateType = 'case-study' | 'legacy';

export interface Template {
  type: TemplateType;
  name: string;
  description: string;
}

export const templates: Template[] = [
  {
    type: 'case-study',
    name: 'Case Study',
    description: 'Structured project with hero, problem, solution, process, details, and final sections',
  },
  {
    type: 'legacy',
    name: 'Legacy Gallery',
    description: 'Freeform gallery with description and image array',
  },
];

export function generateMDX(slug: string, templateType: TemplateType): string {
  const now = new Date().toISOString().split('T')[0];
  
  if (templateType === 'case-study') {
    return `---
title: "${slug}"
tagline: "Project description"
year: ${new Date().getFullYear()}
tags: []
thumbnail: /gallery/${slug}/img/1.jpg
links:
  -
    label: ""
    url: ""
useTemplate: true
hero: /gallery/${slug}/img/1.jpg
problem:
  text: "Describe the problem or challenge."
  image: /gallery/${slug}/img/2.jpg
solution:
  text: "Describe your solution."
  image: /gallery/${slug}/img/3.jpg
process:
  - /gallery/${slug}/img/4.jpg
  - /gallery/${slug}/img/5.jpg
details:
  text: "Additional details about the project."
  image: /gallery/${slug}/img/6.jpg
final:
  main: /gallery/${slug}/img/7.jpg
  detail: /gallery/${slug}/img/8.jpg
  context: /gallery/${slug}/img/9.jpg
gallery: []
---

Add your project content here.
`;
  }

  return `---
title: "${slug}"
tagline: "Project description"
tags: []
thumbnail: /gallery/${slug}/img/1.jpg
gallery: []
useTemplate: false
description: |
  Describe your project here.
links:
  -
    label: ""
    url: ""
---

Add your project content here.
`;
}