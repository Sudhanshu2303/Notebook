import { useMemo } from 'react';

const COLORS = ['var(--mood-1)', 'var(--mood-2)', 'var(--mood-3)', 'var(--mood-4)', 'var(--mood-5)'];

// A one-shot burst of confetti from (x, y) in viewport coordinates.
export default function Confetti({ x, y, big = false }) {
  const pieces = useMemo(() => {
    const count = big ? 60 : 16;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const distance = (big ? 140 : 36) + Math.random() * (big ? 220 : 40);
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - (big ? 60 : 10),
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
      };
    });
  }, [big]);

  return (
    <div className={`confetti${big ? ' big' : ''}`} style={{ left: x, top: y }} aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={p.round ? 'round' : ''}
          style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rotate}deg`, background: p.color }}
        />
      ))}
    </div>
  );
}
