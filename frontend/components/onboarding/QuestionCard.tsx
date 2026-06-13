'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Question, OnboardingAnswers, AnswerValue, TimelineAnswer } from '@/lib/onboardingData';
import { EMOTIONS } from '@/lib/onboardingData';
import SwipeOption from './SwipeOption';
import MultiSelectCloud from './MultiSelectCloud';
import TimelineBuilder from './TimelineBuilder';
import GoalConstellation from './GoalConstellation';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answer: AnswerValue;
  onAnswer: (id: string, value: AnswerValue) => void;
  direction: 1 | -1; // 1 = forward, -1 = backward
}

const cardVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  }),
};

export default function QuestionCard({
  question, questionNumber, totalQuestions, answer, onAnswer, direction,
}: QuestionCardProps) {
  const emotion = EMOTIONS[question.emotion];

  function handleSingle(i: number) { onAnswer(question.id, i); }

  function handleMultiToggle(i: number) {
    const prev = (answer as number[] | null) ?? [];
    if (prev.includes(i)) {
      onAnswer(question.id, prev.filter(x => x !== i));
    } else {
      const max = question.type === 'multi' ? question.max : undefined;
      if (max && prev.length >= max) return;
      onAnswer(question.id, [...prev, i]);
    }
  }

  function handleTimeline(val: TimelineAnswer) { onAnswer(question.id, val); }

  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full"
      layout
    >
      {/* Glassmorphism card */}
      <div
        className="relative w-full rounded-[28px] p-6 sm:p-8 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '0.5px solid rgba(255,255,255,0.9)',
          boxShadow: `
            0 8px 40px rgba(28,26,46,0.08),
            0 1px 3px rgba(28,26,46,0.05),
            inset 0 1px 0 rgba(255,255,255,0.8)
          `,
        }}
      >
        {/* Emotion color wash — top-right corner */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${emotion.color}18 0%, transparent 65%)`,
            transform: 'translate(30%, -30%)',
          }}
        />

        {/* Question number */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: emotion.color }}
          >
            {String(questionNumber).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
          </span>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: emotion.bg,
              border: `0.5px solid ${emotion.border}`,
              color: emotion.text,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: emotion.color }}
            />
            {emotion.name}
          </div>
        </div>

        {/* Narrator hint */}
        <p
          className="text-sm italic mb-2 leading-relaxed"
          style={{ color: '#A09DB8', fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {question.narrator}
        </p>

        {/* Question text */}
        <h2
          className="text-xl sm:text-2xl font-medium leading-snug mb-6"
          style={{
            color: '#1C1A2E',
            fontFamily: "'DM Serif Display', Georgia, serif",
            letterSpacing: '-0.02em',
          }}
        >
          {question.question}
        </h2>

        {/* Interactive area */}
        <div className="relative z-10">
          {question.type === 'single' && (
            <SwipeOption
              options={question.options}
              selected={typeof answer === 'number' ? answer : null}
              onSelect={handleSingle}
              accentColor={emotion.color}
              accentBg={emotion.bg}
            />
          )}

          {question.type === 'multi' && (
            <MultiSelectCloud
              options={question.options}
              selected={Array.isArray(answer) ? (answer as number[]) : []}
              onToggle={handleMultiToggle}
              accentColor={emotion.color}
              accentBg={emotion.bg}
              accentBorder={emotion.border}
              max={question.max}
              hint={question.hint}
            />
          )}

          {question.type === 'timeline' && (
            <TimelineBuilder
              value={(answer as TimelineAnswer | null) ?? []}
              onChange={handleTimeline}
              accentColor={emotion.color}
              accentBg={emotion.bg}
            />
          )}

          {question.type === 'goals' && (
            <GoalConstellation
              options={question.options}
              selected={Array.isArray(answer) ? (answer as number[]) : []}
              onToggle={handleMultiToggle}
              accentColor={emotion.color}
              accentBg={emotion.bg}
              max={question.max}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
