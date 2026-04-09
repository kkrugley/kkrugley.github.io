// redesign/src/types/model-viewer.d.ts
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

interface ModelViewerAttributes extends HTMLAttributes<HTMLElement> {
  src?: string;
  'ios-src'?: string;
  alt?: string;
  'auto-rotate'?: boolean | string;
  'camera-controls'?: boolean | string;
  ar?: boolean | string;
  poster?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<ModelViewerAttributes, HTMLElement>;
    }
  }
}

export {};
