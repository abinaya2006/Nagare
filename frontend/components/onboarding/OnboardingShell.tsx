'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSound } from '@/hooks/useSound';
import { EMOTIONS, QUESTIONS } from '@/lib/onboardingData';
import AmbientBackground from './AmbientBackground';
import FlowOrb from './FlowOrb';
import QuestionCard from './QuestionCard';
import CompletionScreen from './CompletionScreen';

interface OnboardingShellProps {
  onComplete: (answers: Record<string, unknown>) => void;
}

export default function OnboardingShell({ onComplete }: OnboardingShellProps) {
  const {
    phase, currentIndex, answers, progress, currentQuestion,
    setAnswer, advance, goBack, startOnboarding, canAdvance,
  } = useOnboarding();

  const { soundEnabled, toggleSound, playSelect, playTransition, playDone } = useSound();
  const [direction, setDirection] = useState<1 | -1>(1);

  const emotion = currentQuestion ? EMOTIONS[currentQuestion.emotion] : EMOTIONS.haze;

  function handleAdvance() {
    if (!canAdvance) return;
    setDirection(1);
    playTransition(currentQuestion?.emotion ?? 'haze');
    advance();
  }

  function handleBack() {
    setDirection(-1);
    goBack();
  }

  function handleAnswer(id: string, value: unknown) {
    setAnswer(id, value as any);
    playSelect(currentQuestion?.emotion ?? 'haze');
  }

  function handleComplete() {
    playDone();
    onComplete(answers as Record<string, unknown>);
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && canAdvance && phase === 'questions') handleAdvance();
      if (e.key === 'ArrowLeft' && phase === 'questions') handleBack();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canAdvance, phase, currentIndex]);

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <AmbientBackground accentColor={emotion.color} />

      {/* Sound toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleSound}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(28,26,46,0.10)',
            color: '#6B6880',
          }}
          aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── WELCOME SCREEN ── */}
      <AnimatePresence mode="wait">
        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center relative z-10"
          >
            {/* Central orb */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 18 }}
              className="mb-10"
            >
              <FlowOrb progress={0} color="#AFA9EC" size={80} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <p className="text-sm text-[#A09DB8] tracking-widest uppercase mb-3 font-medium">
                Welcome to
              </p>
              <h1
                className="text-4xl sm:text-5xl font-medium mb-4 leading-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#1C1A2E', letterSpacing: '-0.03em' }}
              >
                nagare
              </h1>
              <p className="text-base text-[#6B6880] max-w-xs mx-auto leading-relaxed mb-10">
                Let's understand how your mind naturally flows.
              </p>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(123,110,232,0.32)' }}
                whileTap={{ scale: 0.97 }}
                onClick={startOnboarding}
                className="px-10 py-4 rounded-full text-white font-medium text-base"
                style={{
                  background: 'linear-gradient(135deg, #7B6EE8 0%, #85B7EB 100%)',
                  boxShadow: '0 4px 20px rgba(123,110,232,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Begin
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ── QUESTIONS PHASE ── */}
        {phase === 'questions' && currentQuestion && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1 relative z-10"
          >
            {/* Top nav bar */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
              {/* Back */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleBack}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(12px)',
                  border: '0.5px solid rgba(28,26,46,0.10)',
                  color: '#6B6880',
                  cursor: 'pointer',
                }}
                aria-label="Go back"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>

              {/* Flow Orb + progress */}
              <div className="flex flex-col items-center gap-1">
                <FlowOrb progress={progress} color={emotion.color} size={40} />
                <span className="text-xs text-[#A09DB8]">
                  {Math.round(progress * 100)}%
                </span>
              </div>

              {/* Skip (for optional questions) */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => { setDirection(1); advance(); }}
                className="text-xs text-[#A09DB8] hover:text-[#6B6880] transition-colors px-2 py-1"
                style={{ cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
                aria-label="Skip question"
              >
                Skip
              </motion.button>
            </div>

            {/* Card area */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 pb-4 overflow-hidden">
              <div className="w-full max-w-lg mx-auto">
                <AnimatePresence mode="wait" custom={direction}>
                  <QuestionCard
                    key={currentQuestion.id}
                    question={currentQuestion}
                    questionNumber={currentIndex + 1}
                    totalQuestions={QUESTIONS.length}
                    answer={answers[currentQuestion.id] ?? null}
                    onAnswer={handleAnswer}
                    direction={direction}
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-4 sm:px-6 pb-6 flex-shrink-0">
              <div className="w-full max-w-lg mx-auto">
                {/* Thin progress line */}
                <div
                  className="w-full h-0.5 rounded-full mb-4 overflow-hidden"
                  style={{ background: 'rgba(28,26,46,0.08)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: emotion.color }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                <motion.button
                  whileHover={canAdvance ? { scale: 1.01 } : {}}
                  whileTap={canAdvance ? { scale: 0.98 } : {}}
                  onClick={handleAdvance}
                  disabled={!canAdvance}
                  className="w-full py-4 rounded-2xl text-white font-medium text-sm transition-all"
                  style={{
                    background: canAdvance
                      ? `linear-gradient(135deg, ${emotion.color} 0%, ${emotion.color}CC 100%)`
                      : 'rgba(28,26,46,0.12)',
                    color: canAdvance ? 'white' : '#A09DB8',
                    border: 'none',
                    cursor: canAdvance ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    boxShadow: canAdvance ? `0 4px 16px ${emotion.color}30` : 'none',
                    transition: 'background 0.3s, box-shadow 0.3s, color 0.3s',
                  }}
                >
                  {currentIndex === QUESTIONS.length - 1 ? 'Complete' : 'Continue'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── COMPLETION ── */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8 relative z-10"
          >
            <CompletionScreen answers={answers} onContinue={handleComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
