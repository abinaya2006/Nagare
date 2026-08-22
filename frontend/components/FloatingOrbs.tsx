'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'framer-motion';
import type { OrbConfig } from '@/types';

const ORB_PALETTE = [
  '#AFA9EC', // purple
  '#5DCAA5', // teal
  '#F0997B', // coral
  '#ED93B1', // pink
  '#85B7EB', // blue
];

function makeOrbs(count: number): OrbConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: ORB_PALETTE[i % ORB_PALETTE.length],
    size: 120 + (i % 4) * 60,          // 120–300px
    initialX: 5 + (i * 19) % 88,       // spread across viewport %
    initialY: 5 + (i * 23) % 82,
    duration: 18 + (i * 7) % 22,       // 18–40s per cycle
    xRange: 8 + (i % 4) * 4,           // drift radius in vw
    yRange: 6 + (i % 3) * 4,
  }));
}

interface FloatingOrbsProps {
  /** Extra orb to spawn on signup success */
  spawnNewOrb?: boolean;
  onNewOrbSettled?: () => void;
}

export default function FloatingOrbs({ spawnNewOrb, onNewOrbSettled }: FloatingOrbsProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const count = isMobile ? 4 : 7;
  const [orbs] = useState(() => makeOrbs(count));
  const [extraOrb, setExtraOrb] = useState(false);

  useEffect(() => {
    if (spawnNewOrb) {
      setExtraOrb(true);
      const t = setTimeout(() => {
        onNewOrbSettled?.();
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [spawnNewOrb, onNewOrbSettled]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {orbs.map(orb => (
        <DriftingOrb key={orb.id} orb={orb} />
      ))}

      {/* New orb from signup — fades in at center and joins the drift */}
      {extraOrb && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3, x: '50vw', y: '50vh' }}
          animate={{ opacity: [0, 0.14, 0.11], scale: [0.3, 1.2, 1], x: '72vw', y: '18vh' }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: ORB_PALETTE[1],
            filter: 'blur(8px)',
          }}
        />
      )}
    </div>
  );
}

function DriftingOrb({ orb }: { orb: OrbConfig }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    // Simple elastic bounce between two positions, looped
    const dx = (Math.random() - 0.5) * 2 * orb.xRange;
    const dy = (Math.random() - 0.5) * 2 * orb.yRange;

    async function loop() {
      if (!ref.current || cancelled) return;
      await animate(ref.current,
        { x: [`0vw`, `${dx}vw`, `${-dx * 0.6}vw`, `0vw`],
          y: [`0vh`, `${dy}vh`, `${-dy * 0.5}vh`, `0vh`] },
        { duration: orb.duration, ease: 'easeInOut', repeat: Infinity }
      );
    }
    loop();
    return () => { cancelled = true; };
  }, [orb]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: `${orb.initialX}%`,
        top: `${orb.initialY}%`,
        width: orb.size,
        height: orb.size,
        borderRadius: '50%',
        background: orb.color,
        opacity: 0.10 + (orb.id % 3) * 0.03,  // 10–16%
        filter: `blur(${7 + (orb.id % 3)}px)`,
        willChange: 'transform',
      }}
    />
  );
}
