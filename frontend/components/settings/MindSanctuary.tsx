"use client";

import { usePreferences } from "@/hooks/usePreferences";
import { useSettings } from "@/hooks/useSettings";
import { DEFAULT_PROFILE, SLEEP_HOURS_INFO } from "@/types/settings";

import AmbientBackground from "./AmbientBackground";
import ProfileCrystal from "./ProfileCrystal";
import CircadianRiver from "./CircadianRiver";
import FlowStyleConstellation from "./FlowStyleConstellation";
import FocusEnergyRing from "./FocusEnergyRing";
import DistractionStorm from "./DistractionStorm";
import LifeCurrent from "./LifeCurrent";
import DeadlinePath from "./DeadlinePath";
import PlanningPersonality from "./PlanningPersonality";
import EnergyDrainers from "./EnergyDrainers";
import EnergySources from "./EnergySources";
import RestRhythm from "./RestRhythm";
import ProtectedMoments from "./ProtectedMoments";
import DreamRecovery from "./DreamRecovery";
import NANIInsights from "./NANIInsights";
import PersonalizeButton from "./PersonalizeButton";
import FutureFeatures from "./FutureFeatures";
import ReturnToStillness from "./ReturnToStillness";

/**
 * Mind Sanctuary: a place where Nagare learns who you are. Every section
 * here is a small, playful reflection rather than a setting to configure.
 */
export default function MindSanctuary() {
  const {
    preferences,
    setPreference,
    toggleInArray,
    addProtectedBlock,
    removeProtectedBlock,
  } = usePreferences();

  const profile = DEFAULT_PROFILE;
  const { insights, saveError, save, logout, isLoggedOut } = useSettings(preferences, profile);
  const moonPhase = SLEEP_HOURS_INFO[preferences.sleepHours].moonPhase;

  return (
    <div className="relative pb-32">
      <AmbientBackground circadianPeriod={preferences.circadianPeriod} moonPhase={moonPhase} />

      <header className="mb-6">
        <h1 className="font-display text-2xl font-medium italic text-ink sm:text-3xl">Mind Sanctuary</h1>
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
          <DistractionStorm
            value={preferences.distractions}
            onToggle={(d) => toggleInArray("distractions", d)}
          />
          <LifeCurrent
            value={preferences.lifeCurrent}
            onChange={(level) => setPreference("lifeCurrent", level)}
          />
          <DeadlinePath
            value={preferences.deadlineRelationship}
            onChange={(rel) => setPreference("deadlineRelationship", rel)}
          />
          <PlanningPersonality
            value={preferences.planningPersonality}
            onChange={(p) => setPreference("planningPersonality", p)}
          />
          <EnergyDrainers
            value={preferences.energyDrainers}
            onToggle={(d) => toggleInArray("energyDrainers", d)}
          />
          <EnergySources
            value={preferences.energySources}
            onToggle={(s) => toggleInArray("energySources", s)}
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

          <FutureFeatures />
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
