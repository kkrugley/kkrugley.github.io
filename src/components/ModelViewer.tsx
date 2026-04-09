import { useState, useEffect } from 'react';

interface Props {
  src: string;        // path to .glb file, e.g. /assets/3d_assets/stool-rebuild.glb
  iosSrc?: string;    // path to .usdz file (optional, for iOS AR)
  label?: string;     // link text, default "View 3D Model"
}

export default function ModelViewer({ src, iosSrc, label = 'View 3D Model' }: Props) {
  const [open, setOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load model-viewer script on first open
  useEffect(() => {
    if (!open || scriptLoaded) return;
    if (customElements.get('model-viewer')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    document.head.appendChild(script);
    // Wait for the custom element to be defined rather than relying on onload timing
    customElements.whenDefined('model-viewer').then(() => setScriptLoaded(true));
  }, [open, scriptLoaded]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      <button
        className="model3d-link"
        onClick={() => setOpen(true)}
        aria-label="View 3D model"
      >
        {label}
      </button>

      <div
        className={`model-overlay${open ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        role="dialog"
        aria-modal="true"
        aria-label="3D Model Viewer"
      >
        <button
          className="model-close"
          onClick={() => setOpen(false)}
          aria-label="Close 3D viewer"
        >
          ×
        </button>
        {open && scriptLoaded && (
          // @ts-ignore — model-viewer is a custom element, types declared in src/types/model-viewer.d.ts
          <model-viewer
            src={src}
            ios-src={iosSrc}
            alt="3D model"
            auto-rotate
            camera-controls
            ar
            style={{ width: '90vw', height: '80vh', background: 'transparent' }}
          />
        )}
      </div>
    </>
  );
}
