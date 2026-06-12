'use client';

import { motion } from 'framer-motion';
import OrbTask from './OrbTask';
import type { Task } from '@/types';

interface JarPreviewProps {
  tasks: Task[];
}

export default function JarPreview({ tasks }: JarPreviewProps) {
  // Show today's tasks, max 5
  const todayTasks = tasks.filter(t => t.dueToday).slice(0, 5);
  const doneCount = todayTasks.filter(t => t.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '0.5px solid rgba(28, 26, 46, 0.09)',
        borderRadius: 16,
        padding: '24px 24px 28px',
        boxShadow: '0 1px 16px rgba(28, 26, 46, 0.05)',
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1A2E', letterSpacing: '-0.01em' }}>
          Today's jar
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#A09DB8' }}>
          {doneCount} of {todayTasks.length} done
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#A09DB8', marginBottom: 22 }}>
        Tasks float here — the completed ones settle to the bottom.
      </p>

      {/* Jar boundary */}
      <div
        style={{
          position: 'relative',
          minHeight: 130,
          background: 'rgba(245, 243, 252, 0.6)',
          border: '0.5px solid rgba(175, 169, 236, 0.2)',
          borderRadius: 12,
          padding: '18px 16px 14px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignContent: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Subtle inner waterline for done tasks */}
        {doneCount > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${(doneCount / todayTasks.length) * 38}%`,
            background: 'linear-gradient(to top, rgba(175, 169, 236, 0.06), transparent)',
            borderRadius: '0 0 12px 12px',
            pointerEvents: 'none',
          }} />
        )}

        {todayTasks.map((task, i) => (
          <OrbTask key={task.id} task={task} floatDelay={i * 0.7} />
        ))}
      </div>
    </motion.div>
  );
}
