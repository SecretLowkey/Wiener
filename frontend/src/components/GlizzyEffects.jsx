import React, { useMemo } from 'react';

const WIENER_IMG_URL =
  'https://customer-assets.emergentagent.com/job_6583b0ee-cbd3-4955-a597-92c9cfcc3e14/artifacts/8gh9cgds_image.png';

const NUM_DROPS = 22;

/**
 * GlizzyEffects
 * - Renders a fixed-overlay rain of falling wiener logos across the whole page.
 *
 * This component should be mounted once at the app root.
 */
export default function GlizzyEffects() {
  const drops = useMemo(
    () =>
      Array.from({ length: NUM_DROPS }, (_, i) => {
        const size = 28 + Math.random() * 56; // 28 → 84 px
        const rotStart = Math.random() * 360;
        const rotSpan = 180 + Math.random() * 900; // a couple of full spins
        const dir = Math.random() > 0.5 ? 1 : -1;
        return {
          id: i,
          left: Math.random() * 100, // %
          delay: -(Math.random() * 12), // negative = already in flight
          duration: 7 + Math.random() * 9, // 7 → 16 s
          size,
          rotStart,
          rotEnd: rotStart + dir * rotSpan,
          opacity: 0.55 + Math.random() * 0.45,
          drift: (Math.random() - 0.5) * 80, // px sideways drift
        };
      }),
    []
  );

  return (
    <div className="glizzy-rain" aria-hidden="true" data-testid="glizzy-rain">
      {drops.map((d) => (
        <img
          key={d.id}
          src={WIENER_IMG_URL}
          alt=""
          className="glizzy-drop"
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            opacity: d.opacity,
            '--rot-start': `${d.rotStart}deg`,
            '--rot-end': `${d.rotEnd}deg`,
            '--drift': `${d.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
