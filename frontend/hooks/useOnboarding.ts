'use client';

import { useState, useCallback } from 'react';
import { QUESTIONS, type OnboardingAnswers, type AnswerValue, type TimelineAnswer } from '@/lib/onboardingData';

type OnboardingPhase = 'welcome' | 'questions' | 'complete';

interface UseOnboardingReturn {
  phase: OnboardingPhase;
  currentIndex: number;
  answers: OnboardingAnswers;
  progress: number;  // 0–1
  currentQuestion: typeof QUESTIONS[0] | null;
  setAnswer: (id: string, value: AnswerValue) => void;
  advance: () => void;
  goBack: () => void;
  startOnboarding: () => void;
  canAdvance: boolean;
}

export function useOnboarding(): UseOnboardingReturn {
  const [phase, setPhase] = useState<OnboardingPhase>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const currentQuestion = phase === 'questions' ? QUESTIONS[currentIndex] : null;
  const progress = QUESTIONS.length > 0 ? currentIndex / QUESTIONS.length : 0;

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  const canAdvance = (() => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'timeline') return true; // always skippable
    if (currentQuestion.type === 'multi' || currentQuestion.type === 'goals') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== null && answer !== undefined;
  })();

  const advance = useCallback(() => {
    if (currentIndex >= QUESTIONS.length - 1) {
      setPhase('complete');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    } else {
      setPhase('welcome');
    }
  }, [currentIndex]);

  const startOnboarding = useCallback(() => {
    setPhase('questions');
    setCurrentIndex(0);
  }, []);

  return {
    phase, currentIndex, answers, progress, currentQuestion,
    setAnswer, advance, goBack, startOnboarding, canAdvance,
  };
}
