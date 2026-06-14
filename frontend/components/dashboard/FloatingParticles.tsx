"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

/**
 * Tiny glowing motes that slowly rise and fade, like quiet thoughts drifting
 * upward. Purely decorative and aria-hidden.
 */
export default function FloatingParticles({
  count = 18,
  className = "",
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<
    {
      id: number;
      left: number;
      size: number;
      delay: number;
      duration: number;
      hue: string;
    }[]
  >([]);

  // Only generate on the client — never on the server
  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        size: 3 + Math.round(Math.random() * 6),
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 10,
        hue: ["bg-lavender", "bg-sky", "bg-gold", "bg-peach"][i % 4],
      })),
    );
  }, [count]);

  // Render nothing on the server — no mismatch possible
  if (particles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute rounded-full ${p.hue} opacity-60 blur-[1px]`}
          style={{
            left: `${p.left}%`,
            bottom: "-2rem",
            width: p.size,
            height: p.size,
          }}
          animate={{ y: [0, -260], opacity: [0, 0.6, 0] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
