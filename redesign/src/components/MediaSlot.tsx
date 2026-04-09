// redesign/src/components/MediaSlot.tsx
import { useState, useEffect } from 'react';

type MediaData =
  | string
  | { type: 'image'; src: string; alt?: string }
  | { type: 'model3d'; src: string; iosSrc?: string; alt?: string };

interface Props {
  media?: MediaData;
  className?: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}

export default function MediaSlot({ media, className = 'cs-ph', style, imgStyle }: Props) {
  const [modelReady, setModelReady] = useState(false);

  const isModel = !!media && typeof media !== 'string' && media.type === 'model3d';

  useEffect(() => {
    if (!isModel) return;
    const existing = document.querySelector('script[data-model-viewer]');
    if (existing) {
      customElements.whenDefined('model-viewer').then(() => setModelReady(true));
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.setAttribute('data-model-viewer', '');
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    document.head.appendChild(script);
    customElements.whenDefined('model-viewer').then(() => setModelReady(true));
  }, [isModel]);

  if (!media) return <div className={className} style={style} />;

  const src = typeof media === 'string' ? media : media.src;
  const alt = typeof media === 'string' ? '' : (media.alt ?? '');

  if (typeof media === 'string' || media.type === 'image') {
    return (
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: 'auto', borderRadius: '4px', display: 'block', ...imgStyle }}
      />
    );
  }

  if (media.type === 'model3d') {
    if (!modelReady) {
      return (
        <div className={className} style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
          Loading 3D…
        </div>
      );
    }
    return (
      // @ts-ignore — model-viewer custom element
      <model-viewer
        src={src}
        ios-src={media.iosSrc}
        alt={alt || '3D model'}
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '280px', borderRadius: '6px', background: '#f3f3f3' }}
      />
    );
  }

  return <div className={className} style={style} />;
}
