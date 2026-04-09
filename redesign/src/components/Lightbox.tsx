import { useState, useEffect, useCallback } from 'react';

interface Props {
  images: string[];   // absolute URL paths to all gallery images
  alts?: string[];
}

export default function Lightbox({ images, alts = [] }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % images.length);
  }, [images.length]);

  const close = useCallback(() => setModalOpen(false), []);

  // Keyboard navigation — always active (navigates thumbnails even when modal closed)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, close]);

  // Touch swipe — always active
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.changedTouches[0].screenX; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].screenX - startX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    };
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [prev, next]);

  if (images.length === 0) return null;

  return (
    <div className="project-gallery">
      {/* Main image */}
      <img
        className="main-image"
        src={images[currentIndex]}
        alt={alts[currentIndex] ?? ''}
        onClick={() => setModalOpen(true)}
      />

      {/* Thumbnails — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="thumbnails">
          {images.map((src, i) => (
            <img
              key={src}
              className={`thumbnail${i === currentIndex ? ' active' : ''}`}
              src={src}
              alt={alts[i] ?? ''}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}

      {/* Modal lightbox */}
      <div
        className={`modal-overlay${modalOpen ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) close(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
      >
        <button className="modal-close" onClick={close} aria-label="Close lightbox">×</button>
        <button className="modal-prev" onClick={prev} aria-label="Previous image">‹</button>
        <img
          className="modal-img"
          src={images[currentIndex]}
          alt={alts[currentIndex] ?? ''}
        />
        <button className="modal-next" onClick={next} aria-label="Next image">›</button>
      </div>
    </div>
  );
}
