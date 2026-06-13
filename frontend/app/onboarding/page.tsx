'use client';
import { useRouter } from 'next/navigation';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { api } from '@/services/api';
import { QUESTIONS } from '@/lib/onboardingData';

function mapAnswersToPreferences(answers: Record<string, unknown>) {
  const getText = (id: string): string | undefined => {
    const q = QUESTIONS.find(q => q.id === id);
    const val = answers[id];
    if (!q || val === null || val === undefined) return undefined;
    if (typeof val === 'number' && 'options' in q) return q.options[val as number];
    return undefined;
  };

  const getIndex = (id: string): number | undefined => {
    const val = answers[id];
    if (typeof val === 'number') return val;
    return undefined;
  };

  const peakTime = getText('peak_time');
  const productivityMap: Record<string, string> = {
    'Early morning, before 11': 'morning',
    'Afternoon, once settled': 'afternoon',
    'Evening, when things slow': 'evening',
    'Late night — just me and quiet': 'night',
    'It shifts with my mood': 'morning',
  };

  const focusMap: Record<number, number> = {
    0: 20, 1: 37, 2: 52, 3: 75, 4: 120,
  };

  const taskCountMap: Record<number, number> = {
    0: 3, 1: 5, 2: 7, 3: 10,
  };

  const blockedTimes = (answers['blocked_times'] as { label: string; start: string; end: string }[] | undefined) ?? [];
  const routine_tasks = blockedTimes.map(b => ({
    title: b.label || 'Blocked time',
    start_time: b.start,
    end_time: b.end,
    days: ['daily'],
    is_active: true,
  }));

  const focusIndex = getIndex('focus_span');
  const dayFullnessIndex = getIndex('day_fullness');

  return {
    productivity_period: peakTime ? productivityMap[peakTime] : undefined,
    work_style: getText('work_style'),
    focus_duration_minutes: focusIndex !== undefined ? focusMap[focusIndex] : undefined,
    break_preference: getText('break_preference'),
    sleep_hours: getText('sleep'),
    task_count: dayFullnessIndex !== undefined ? taskCountMap[dayFullnessIndex] : undefined,
    routine_tasks,
  };
}

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = async (answers: Record<string, unknown>) => {
    try {
      const payload = mapAnswersToPreferences(answers);
      console.log('📤 Payload to send:', payload);
      await api.put('/preferences/me', payload);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
    router.push('/dashboard');
  };

  return <OnboardingShell onComplete={handleComplete} />;
}
