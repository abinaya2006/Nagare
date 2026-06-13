'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface Blob {
  id: number;
  color: string;
  size: number;
  x: number;  // % of viewport
  y: number;
  duration: number;
  dx: number;
  dy: number;
}

const BLOBS: Blob[] = [
  { id: 0, color: '#C5C0F0', size: 480, x: -8,  y: -10, duration: 32, dx: 12, dy: 14 },
  { id: 1, color: '#A8D8F0', size: 360, x: 70,  y: -5,  duration: 26, dx: -10, dy: 18 },
  { id: 2, color: '#F5C9B0', size: 300, x: 60,  y: 65,  duration: 38, dx: 16, dy: -12 },
  { id: 3, color: '#B8EDD9', size: 260, x: -5,  y: 55,  duration: 29, dx: 14, dy: -10 },
  { id: 4, color: '#F0D4E8', size: 220, x: 40,  y: 30,  duration: 44, dx: -8,  dy: 12 },
];

const MOBILE_BLOBS = BLOBS.slice(0, 3);

interface AmbientBackgroundProps {
  accentColor?: string;
}

export default function AmbientBackground({ accentColor }: AmbientBackgroundProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const blobs = isMobile ? MOBILE_BLOBS : BLOBS;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0 transition-all duration-[1200ms]"
        style={{
          background: accentColor
            ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${accentColor}18 0%, transparent 70%), linear-gradient(160deg, #F8F6FF 0%, #F0EDF8 40%, #EDF5F8 100%)`
            : 'linear-gradient(160deg, #F8F6FF 0%, #F0EDF8 40%, #EDF5F8 100%)',
        }}
      />

      {blobs.map(blob => (
        <DriftBlob key={blob.id} blob={blob} />
      ))}

      {/* Soft grain overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  );
}

function DriftBlob({ blob }: { blob: Blob }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    async function loop() {
      if (!ref.current || cancelled) return;
      await animate(
        ref.current,
        {
          x: [0, blob.dx, -blob.dx * 0.6, blob.dx * 0.3, 0],
          y: [0, blob.dy, blob.dy * 0.5, -blob.dy * 0.4, 0],
        },
        { duration: blob.duration, ease: 'easeInOut', repeat: Infinity }
      );
    }
    loop();
    return () => { cancelled = true; };
  }, [blob]);

  return (
    <div
      ref={ref}
      className="absolute rounded-full will-change-transform"
      style={{
        left: `${blob.x}%`,
        top: `${blob.y}%`,
        width: blob.size,
        height: blob.size,
        background: blob.color,
        opacity: 0.28,
        filter: 'blur(72px)',
      }}
    />
  );
}
