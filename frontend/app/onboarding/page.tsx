'use client';

import { useApp } from '@/contexts/AppContext';
import OnboardingShell from '@/components/onboarding/OnboardingShell';

export default function OnboardingPage() {
  const { completeOnboarding } = useApp();

  return <OnboardingShell onComplete={completeOnboarding} />;
}
