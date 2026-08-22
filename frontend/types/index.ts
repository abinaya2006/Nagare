export interface NANIProcessResult {
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  state: "waiting" | "active" | "done";
  category: string;
  constellation: string;
  deadline: string;
  duration: string;
  energy: string;
  segment: "morning" | "afternoon" | "evening" | "night";
  notes: string;
  insight: string;
}
// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskState = "waiting" | "flowing" | "resolved" | "overdue";
export type TaskSegment = "morning" | "afternoon" | "evening";
export type TaskCategory =
  | "Study"
  | "Projects"
  | "Creative Work"
  | "Exploration"
  | "Habits"
  | "focus"
  | "admin"
  | "creative"
  | "health"
  | "social";
export type Constellation =
  | "The Scholar"
  | "The Builder"
  | "The Dreamer"
  | "The Explorer"
  | "The Guardian";

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  state: TaskState;
  category: TaskCategory;
  constellation: Constellation;
  deadline: string;
  duration: string;
  energy: "Low" | "Medium" | "High";
  notes?: string;
  segment: TaskSegment;
  createdAt: string;
  // legacy aliases — keeps old components compiling
  completed?: boolean;
  done?: boolean;
  dueToday?: boolean;
  status?: string;
  estimatedDuration?: number;
  description?: string;
  estimated_duration_minutes?: number;
}

export type CreateTaskInput = Partial<Task> & { title: string };
export type TaskInput = CreateTaskInput;

// ─── Priority (legacy alias) ──────────────────────────────────────────────────
export type Priority = TaskPriority;

// ─── Schedule ────────────────────────────────────────────────────────────────
export interface ScheduleBlock {
  id: string;
  time: string;
  label: string;
}
export interface ScheduleOutput {
  blocks: ScheduleBlock[];
}

// ─── NANI ────────────────────────────────────────────────────────────────────
export interface NaniMessage {
  id: string;
  role: "user" | "nani";
  content: string;
  timestamp: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface MindSnapshotData {
  total: number;
  pending: number;
  completed: number;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  profileComplete: boolean;
  onboardingComplete: boolean;
}

export interface OrbConfig {
  id: number;
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  xRange: number;
  yRange: number;
}

export type AppPage = "login" | "signup" | "onboarding" | "dashboard";
