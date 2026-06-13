'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface FlowOrbProps {
  progress: number;  // 0–1
  color?: string;
  size?: number;
}

/**
 * The Flow Orb evolves visually as progress increases:
 *  0%  → tiny dim particle
 * 25%  → small glowing orb
 * 50%  → layered orb with inner ring
 * 75%  → flowing energy ring orbiting
 * 100% → full emotional constellation
 */
export default function FlowOrb({ progress, color = '#AFA9EC', size = 56 }: FlowOrbProps) {
  const stage = progress >= 1 ? 4 : progress >= 0.75 ? 3 : progress >= 0.5 ? 2 : progress >= 0.25 ? 1 : 0;

  const orbSize = size * (0.4 + progress * 0.6);
  const glowSize = orbSize * (1 + stage * 0.5);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Progress: ${Math.round(progress * 100)}%`}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Outer glow */}
      {stage >= 1 && (
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: glowSize,
            height: glowSize,
            background: color,
            filter: 'blur(10px)',
          }}
        />
      )}

      {/* Energy ring — stage 3+ */}
      {stage >= 3 && (
        <motion.div
          className="absolute rounded-full border"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            width: orbSize * 1.6,
            height: orbSize * 1.6,
            borderColor: color + '80',
            borderWidth: 1.5,
          }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 6, height: 6,
              background: color,
              top: -3, left: '50%', marginLeft: -3,
            }}
          />
        </motion.div>
      )}

      {/* Inner secondary ring — stage 2+ */}
      {stage >= 2 && (
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{
            width: orbSize * 1.2,
            height: orbSize * 1.2,
            background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Core orb */}
      <motion.div
        className="relative rounded-full"
        animate={{ scale: stage === 0 ? [0.9, 1.1, 0.9] : [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: orbSize,
          height: orbSize,
          background: stage === 0
            ? `radial-gradient(circle at 35% 35%, #fff 0%, ${color}40 100%)`
            : `radial-gradient(circle at 35% 35%, #fff 0%, ${color} 60%, ${color}CC 100%)`,
          boxShadow: stage >= 1 ? `0 0 ${stage * 8}px ${color}80` : 'none',
        }}
      />

      {/* Constellation dots — stage 4 */}
      {stage >= 4 && (
        <>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <motion.div
              key={deg}
              className="absolute rounded-full"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
              style={{
                width: 4, height: 4,
                background: color,
                top: '50%', left: '50%',
                marginTop: -2, marginLeft: -2,
                transform: `rotate(${deg}deg) translateY(-${orbSize * 0.85}px)`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
