'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  dotColor: string;
  delay?: number;
}

export default function StatCard({ label, value, sub, dotColor, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 + delay, ease: 'easeOut' }}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        padding: '16px 16px 14px',
        background: 'rgba(255, 255, 255, 0.70)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '0.5px solid rgba(28, 26, 46, 0.08)',
        borderRadius: 12,
        boxShadow: '0 1px 8px rgba(28, 26, 46, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#A09DB8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1C1A2E', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '0.6875rem', color: '#A09DB8', marginTop: 4 }}>{sub}</p>
      )}
    </motion.div>
  );
}
