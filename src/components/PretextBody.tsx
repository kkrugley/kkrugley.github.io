// redesign/src/components/PretextBody.tsx
// Uses @chenglou/pretext for accurate multiline text measurement (avoids DOM reflow).
// Renders text to DOM normally but pre-measures height to prevent layout shift.
import { useState, useEffect, useRef } from 'react';
import { prepare, layout } from '@chenglou/pretext';

interface Props {
  text: string;
  font?: string;       // CSS font shorthand, e.g. '13px "Times New Roman"'
  lineHeight?: number; // px, should match CSS line-height
  className?: string;
}

export default function PretextBody({
  text,
  font = '13px "Times New Roman", Times, serif',
  lineHeight = 21,
  className = 'cs-body',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const width = container.offsetWidth;
      if (width === 0) return;
      const prepared = prepare(text, font);
      const { height } = layout(prepared, width, lineHeight);
      setMinHeight(height);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [text, font, lineHeight]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={minHeight !== undefined ? { minHeight } : undefined}
    >
      {text}
    </div>
  );
}
