"use client";
import { useEffect, useState } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { useSettings } from "@/hooks/useSettings";
import { DEFAULT_PROFILE, SLEEP_HOURS_INFO, type UserProfile } from "@/types/settings";
import { api } from "@/services/api";

import AmbientBackground from "./AmbientBackground";
import ProfileCrystal from "./ProfileCrystal";
import CircadianRiver from "./CircadianRiver";
import FlowStyleConstellation from "./FlowStyleConstellation";
import FocusEnergyRing from "./FocusEnergyRing";
import RestRhythm from "./RestRhythm";
import ProtectedMoments from "./ProtectedMoments";
import DreamRecovery from "./DreamRecovery";
import NANIInsights from "./NANIInsights";
import PersonalizeButton from "./PersonalizeButton";
import ReturnToStillness from "./ReturnToStillness";

export default function MindSanctuary() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      const email: string = data?.email ?? "";
      const name = data?.name || email.split("@")[0];
      setProfile({
        name,
        email,
        avatarInitial: name.charAt(0).toUpperCase(),
      });
    }).catch(() => {});
  }, []);

  const {
    preferences,
    loading,
    setPreference,
    addProtectedBlock,
    removeProtectedBlock,
  } = usePreferences();

  const { insights, saveError, save, logout, isLoggedOut } = useSettings(preferences, profile);
  const moonPhase = SLEEP_HOURS_INFO[preferences.sleepHours].moonPhase;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-ink-soft text-sm">Loading your preferences...</p>
    </div>
  );

  return (
    <div className="relative pb-32">
      <AmbientBackground circadianPeriod={preferences.circadianPeriod} moonPhase={moonPhase} />
      <header className="mb-6">
        <h1 className="font-display text-2xl font-medium italic text-ink sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">A place where your flow learns who you are.</p>
      </header>
      <div className="mb-6">
        <ProfileCrystal profile={profile} preferences={preferences} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <CircadianRiver
            value={preferences.circadianPeriod}
            onChange={(period) => setPreference("circadianPeriod", period)}
          />
          <FlowStyleConstellation
            value={preferences.flowStyle}
            onChange={(style) => setPreference("flowStyle", style)}
          />
          <FocusEnergyRing
            value={preferences.focusDuration}
            onChange={(duration) => setPreference("focusDuration", duration)}
          />
          <RestRhythm
            value={preferences.breakPreference}
            onChange={(pref) => setPreference("breakPreference", pref)}
          />
          <ProtectedMoments
            blocks={preferences.protectedBlocks}
            onAdd={addProtectedBlock}
            onRemove={removeProtectedBlock}
          />
          <DreamRecovery
            value={preferences.sleepHours}
            onChange={(hours) => setPreference("sleepHours", hours)}
          />
          <ReturnToStillness onLogout={logout} isLoggedOut={isLoggedOut} />
        </div>
        <div>
          <NANIInsights insights={insights} />
        </div>
      </div>
      {saveError && (
        <p className="mt-4 text-center text-xs text-coral-glow">{saveError}</p>
      )}
      <PersonalizeButton onSave={save} />
    </div>
  );
}
