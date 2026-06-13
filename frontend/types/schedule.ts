import type { Task } from "./task";

export interface ScheduleSlot {
  time: string;
  task: string;
  duration: string;
  taskId?: string;
}

export interface Schedule {
  id: string;
  date: string;
  slots: ScheduleSlot[];
  flowBalance: number;
  generatedAt: string;
}

export interface FlowBalance {
  score: number;
  state: "dry" | "balanced" | "turbulent";
  label: string;
}

export interface ScheduledDay {
  date: string;
  tasks: Task[];
  schedule: ScheduleSlot[];
  balance: FlowBalance;
}
