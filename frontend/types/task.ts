export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskState = "waiting" | "flowing" | "resolved" | "overdue";
export type TaskSegment = "morning" | "afternoon" | "evening";
export type TaskCategory =
  | "Study"
  | "Projects"
  | "Creative Work"
  | "Exploration"
  | "Habits";

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
}

export interface CreateTaskInput {
  title: string;
  priority?: TaskPriority;
  state?: TaskState;
  category?: TaskCategory;
  constellation?: Constellation;
  deadline?: string;
  duration?: string;
  energy?: "Low" | "Medium" | "High";
  notes?: string;
  segment?: TaskSegment;
}

export interface NANIProcessResult {
  title: string;
  priority: TaskPriority;
  state: TaskState;
  category: TaskCategory;
  constellation: Constellation;
  deadline: string;
  duration: string;
  energy: "Low" | "Medium" | "High";
  segment: TaskSegment;
  notes: string;
  insight: string;
}
