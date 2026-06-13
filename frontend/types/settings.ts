// ─────────────────────────────────────────────────────────────────────────
// Mind Sanctuary preference types
// Every choice here shapes how Nagare reads the user's rhythm - never
// "configuration", always "a little more of who you are".
// ─────────────────────────────────────────────────────────────────────────

export type CircadianPeriod = "morning" | "afternoon" | "evening" | "night";

export type FlowStyle =
  | "early-finisher"
  | "deadline-rider"
  | "balanced-voyager"
  | "energy-hopper"
  | "still-discovering";

export type FocusDuration = "15-25" | "30-45" | "45-60" | "60-90" | "90+";

export type Distraction =
  | "social-media"
  | "notifications"
  | "overthinking"
  | "multitasking"
  | "family"
  | "hunger";

export type LifeCurrentLevel = "mostly-free" | "moderately-busy" | "very-busy" | "pure-chaos";

export type DeadlineRelationship =
  | "finish-early"
  | "just-in-time"
  | "procrastinate-sometimes"
  | "last-minute-survivor";

export type PlanningPersonality =
  | "organized-one"
  | "last-minute-genius"
  | "chaos-coordinator"
  | "overplanner"
  | "what-deadline";

export type EnergyDrainer =
  | "studying"
  | "meetings"
  | "coding"
  | "creative-work"
  | "chores"
  | "admin-tasks"
  | "social-interactions";

export type EnergySource =
  | "learning"
  | "projects"
  | "creative-work"
  | "people"
  | "exercise"
  | "organizing"
  | "problem-solving";

export type BreakPreference = "25min" | "45min" | "60min" | "whenever-tired" | "forget-breaks";

export type SleepHours = "less-than-5" | "5-6" | "6-7" | "7-8" | "8-plus";

export type ProtectedCategory = "sleep" | "classes" | "work" | "family" | "commute" | "custom";

export interface ProtectedBlock {
  id: string;
  category: ProtectedCategory;
  label: string;
  /** hour of day, 0-24, may be fractional (e.g. 7.5 = 7:30) */
  startHour: number;
  endHour: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarInitial: string;
}

export interface FlowPreferences {
  circadianPeriod: CircadianPeriod;
  flowStyle: FlowStyle | null;
  focusDuration: FocusDuration;
  distractions: Distraction[];
  lifeCurrent: LifeCurrentLevel;
  deadlineRelationship: DeadlineRelationship | null;
  planningPersonality: PlanningPersonality | null;
  energyDrainers: EnergyDrainer[];
  energySources: EnergySource[];
  breakPreference: BreakPreference;
  protectedBlocks: ProtectedBlock[];
  sleepHours: SleepHours;
}

// ─────────────────────────────────────────────────────────────────────────
// Labels, lore, and visual mappings
// ─────────────────────────────────────────────────────────────────────────

export const CIRCADIAN_LABELS: Record<CircadianPeriod, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

export const CIRCADIAN_COLORS: Record<CircadianPeriod, string> = {
  morning: "#FFF4C7", // soft gold
  afternoon: "#FCFCFF", // warm white
  evening: "#E8E1FF", // lavender
  night: "#AFC8FF", // deep blue
};

export const CIRCADIAN_NANI_LINES: Record<CircadianPeriod, string> = {
  morning: "You seem to think clearest right as the day begins.",
  afternoon: "Midday holds a steady kind of focus for you.",
  evening: "You seem to think clearest during the evening.",
  night: "The quiet hours bring your sharpest thinking.",
};

export const FLOW_STYLE_INFO: Record<FlowStyle, { label: string; lore: string }> = {
  "early-finisher": {
    label: "Early Finisher",
    lore: "You like to set things down long before they're due.",
  },
  "deadline-rider": {
    label: "Deadline Rider",
    lore: "Pressure doesn't scare you - it sharpens you.",
  },
  "balanced-voyager": {
    label: "Balanced Voyager",
    lore: "You prefer steady movement over sudden bursts.",
  },
  "energy-hopper": {
    label: "Energy Hopper",
    lore: "You move between tasks the moment your spark shifts.",
  },
  "still-discovering": {
    label: "Still Discovering",
    lore: "You're learning your own rhythm as you go - and that's alright.",
  },
};

export const FOCUS_DURATION_LABELS: Record<FocusDuration, string> = {
  "15-25": "15–25 min",
  "30-45": "30–45 min",
  "45-60": "45–60 min",
  "60-90": "60–90 min",
  "90+": "90+ min",
};

export const FOCUS_DURATION_ORDER: FocusDuration[] = ["15-25", "30-45", "45-60", "60-90", "90+"];

export const DISTRACTION_LABELS: Record<Distraction, string> = {
  "social-media": "Social Media",
  notifications: "Notifications",
  overthinking: "Overthinking",
  multitasking: "Multitasking",
  family: "Family",
  hunger: "Hunger",
};

export const LIFE_CURRENT_INFO: Record<LifeCurrentLevel, { label: string; description: string; widthClass: string }> = {
  "mostly-free": {
    label: "Mostly Free",
    description: "A small, peaceful stream.",
    widthClass: "w-1/4",
  },
  "moderately-busy": {
    label: "Moderately Busy",
    description: "A gentle, steady river.",
    widthClass: "w-1/2",
  },
  "very-busy": {
    label: "Very Busy",
    description: "A strong current, but still flowing.",
    widthClass: "w-3/4",
  },
  "pure-chaos": {
    label: "Pure Chaos",
    description: "Waterfall energy.",
    widthClass: "w-full",
  },
};

export const LIFE_CURRENT_ORDER: LifeCurrentLevel[] = [
  "mostly-free",
  "moderately-busy",
  "very-busy",
  "pure-chaos",
];

export const DEADLINE_PATH_INFO: Record<DeadlineRelationship, { label: string; lore: string }> = {
  "finish-early": {
    label: "Finish Early",
    lore: "You'd rather arrive with time to spare.",
  },
  "just-in-time": {
    label: "Just In Time",
    lore: "Right on the line feels just right.",
  },
  "procrastinate-sometimes": {
    label: "Procrastinate Sometimes",
    lore: "Some things wait until they're ready to be done.",
  },
  "last-minute-survivor": {
    label: "Last Minute Survivor",
    lore: "Somehow, it always comes together at the end.",
  },
};

export const PLANNING_PERSONALITY_INFO: Record<PlanningPersonality, { label: string; lore: string }> = {
  "organized-one": {
    label: "The Organized One",
    lore: "Everything has a place, and a time.",
  },
  "last-minute-genius": {
    label: "Last Minute Genius",
    lore: "Brilliance arrives right when it's needed.",
  },
  "chaos-coordinator": {
    label: "Chaos Coordinator",
    lore: "Somehow, order emerges from the noise.",
  },
  overplanner: {
    label: "Overplanner",
    lore: "A plan for the plan feels comforting.",
  },
  "what-deadline": {
    label: "What Deadline?",
    lore: "Time is more of a suggestion.",
  },
};

export const ENERGY_DRAINER_LABELS: Record<EnergyDrainer, string> = {
  studying: "Studying",
  meetings: "Meetings",
  coding: "Coding",
  "creative-work": "Creative Work",
  chores: "Chores",
  "admin-tasks": "Admin Tasks",
  "social-interactions": "Social Interactions",
};

export const ENERGY_SOURCE_LABELS: Record<EnergySource, string> = {
  learning: "Learning",
  projects: "Projects",
  "creative-work": "Creative Work",
  people: "People",
  exercise: "Exercise",
  organizing: "Organizing",
  "problem-solving": "Problem Solving",
};

export const BREAK_PREFERENCE_INFO: Record<BreakPreference, { label: string; position: number }> = {
  "25min": { label: "25 min", position: 0 },
  "45min": { label: "45 min", position: 25 },
  "60min": { label: "60 min", position: 50 },
  "whenever-tired": { label: "Whenever Tired", position: 75 },
  "forget-breaks": { label: "Forget Breaks", position: 100 },
};

export const BREAK_PREFERENCE_ORDER: BreakPreference[] = [
  "25min",
  "45min",
  "60min",
  "whenever-tired",
  "forget-breaks",
];

export const PROTECTED_CATEGORY_INFO: Record<ProtectedCategory, { label: string; color: string }> = {
  sleep: { label: "Sleep", color: "#AFC8FF" },
  classes: { label: "Classes", color: "#E8E1FF" },
  work: { label: "Work", color: "#FFE8D6" },
  family: { label: "Family", color: "#FFF4C7" },
  commute: { label: "Commute", color: "#DDEEFF" },
  custom: { label: "Custom", color: "#C9B6FF" },
};

export const SLEEP_HOURS_INFO: Record<SleepHours, { label: string; moonPhase: number }> = {
  "less-than-5": { label: "Less than 5", moonPhase: 0 }, // new moon
  "5-6": { label: "5–6 hrs", moonPhase: 0.25 }, // waxing crescent
  "6-7": { label: "6–7 hrs", moonPhase: 0.5 }, // half moon
  "7-8": { label: "7–8 hrs", moonPhase: 0.75 }, // waxing gibbous
  "8-plus": { label: "8+ hrs", moonPhase: 1 }, // full moon
};

export const SLEEP_HOURS_ORDER: SleepHours[] = ["less-than-5", "5-6", "6-7", "7-8", "8-plus"];

export const DEFAULT_PREFERENCES: FlowPreferences = {
  circadianPeriod: "evening",
  flowStyle: "balanced-voyager",
  focusDuration: "45-60",
  distractions: ["notifications", "overthinking"],
  lifeCurrent: "moderately-busy",
  deadlineRelationship: "just-in-time",
  planningPersonality: "organized-one",
  energyDrainers: ["meetings", "admin-tasks"],
  energySources: ["projects", "problem-solving"],
  breakPreference: "45min",
  protectedBlocks: [
    { id: "sleep-1", category: "sleep", label: "Sleep", startHour: 23, endHour: 7 },
    { id: "work-1", category: "work", label: "Work", startHour: 9, endHour: 17 },
  ],
  sleepHours: "6-7",
};

export const DEFAULT_PROFILE: UserProfile = {
  name: "Abi",
  email: "abi@nagare.app",
  avatarInitial: "A",
};
