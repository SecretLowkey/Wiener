import React, { useEffect, useMemo, useRef, useState } from 'react';

const WIENER_IMG_URL =
  'https://customer-assets.emergentagent.com/job_6583b0ee-cbd3-4955-a597-92c9cfcc3e14/artifacts/8gh9cgds_image.png';

const NUM_DROPS = 22;

/**
 * GlizzyEffects
 * - Renders a fixed-overlay rain of falling wiener logos across the whole page.
 * - Renders a custom cursor that's a wiener following the mouse.
 *
 * This component should be mounted once at the app root.
 */
export default function GlizzyEffects() {
  // ── falling wieners ──────────────────────────────────────
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

  // ── custom cursor ────────────────────────────────────────
  const cursorRef = useRef(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  // Use refs + rAF so the cursor is buttery smooth and doesn't trigger React re-renders.
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    let rafId;

    const onMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!cursorVisible) setCursorVisible(true);
    };
    const onLeave = () => setCursorVisible(false);
    const onEnter = () => setCursorVisible(true);

    const tick = () => {
      const t = targetPos.current;
      const c = currentPos.current;
      // Smooth lerp toward the cursor position
      c.x += (t.x - c.x) * 0.32;
      c.y += (t.y - c.y) * 0.32;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${
          c.x - 22
        }px, ${c.y - 22}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // Disable on touch devices
    const isTouch =
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    if (isTouch) {
      setCursorVisible(false);
    }

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, [cursorVisible]);

  return (
    <>
      <div className="glizzy-rain" aria-hidden="true">
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

      <div
        ref={cursorRef}
        className={`glizzy-cursor ${cursorVisible ? 'visible' : ''}`}
        aria-hidden="true"
      >
        <img src={WIENER_IMG_URL} alt="" />
      </div>
    </>
  );
}
