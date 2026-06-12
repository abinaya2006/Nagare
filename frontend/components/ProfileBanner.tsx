'use client';

import { motion } from 'framer-motion';

interface ProfileBannerProps {
  onSetup: () => void;
}

export default function ProfileBanner({ onSetup }: ProfileBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 18px',
        background: '#FEF7EC',
        border: '0.5px solid #F6D98A',
        borderRadius: 12,
        marginBottom: 24,
      }}
    >
      {/* Clock icon */}
      <svg
        width="20" height="20" viewBox="0 0 20 20" fill="none"
        style={{ flexShrink: 0, marginTop: 1 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="8.5" stroke="#D4960A" strokeWidth="1.2"/>
        <path d="M10 6v4l2.5 2.5" stroke="#D4960A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#92610A', marginBottom: 2 }}>
          Complete your profile
        </p>
        <p style={{ fontSize: '0.75rem', color: '#B07820', lineHeight: 1.5 }}>
          Add your work hours so Nagare can schedule tasks around your day — not against it.
        </p>
      </div>

      <button
        onClick={onSetup}
        style={{
          flexShrink: 0,
          padding: '6px 14px',
          fontSize: '0.75rem',
          fontWeight: 500,
          fontFamily: "'Inter', sans-serif",
          color: '#92610A',
          background: 'rgba(214, 150, 10, 0.12)',
          border: '0.5px solid rgba(214, 150, 10, 0.35)',
          borderRadius: 7,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(214, 150, 10, 0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(214, 150, 10, 0.12)')}
      >
        Set up
      </button>
    </motion.div>
  );
}
