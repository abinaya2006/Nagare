'use client';

import { useState, useCallback, useEffect } from 'react';
import { playNote, playChime, playCompletion } from '@/lib/audio';
import { EMOTIONS } from '@/lib/onboardingData';

interface UseSoundReturn {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSelect: (emotionKey: string) => void;
  playTransition: (emotionKey: string) => void;
  playDone: () => void;
}

const STORAGE_KEY = 'nagare_sound';

export function useSound(): UseSoundReturn {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setSoundEnabled(stored === 'true');
    } catch { /* ignore */ }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const playSelect = useCallback((emotionKey: string) => {
    if (!soundEnabled) return;
    const emotion = EMOTIONS[emotionKey];
    if (emotion) playNote(emotion.note, 0.15, 0.7);
  }, [soundEnabled]);

  const playTransition = useCallback((emotionKey: string) => {
    if (!soundEnabled) return;
    const emotion = EMOTIONS[emotionKey];
    if (emotion) playChime(emotion.note);
  }, [soundEnabled]);

  const playDone = useCallback(() => {
    if (!soundEnabled) return;
    playCompletion();
  }, [soundEnabled]);

  return { soundEnabled, toggleSound, playSelect, playTransition, playDone };
}
