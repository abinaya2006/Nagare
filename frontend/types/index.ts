export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "Scheduled" | "Completed";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  deadline: string | null;
  estimated_duration_minutes: number;
  priority: Priority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  deadline?: string | null;
  estimated_duration_minutes: number;
  priority: Priority;
  status?: TaskStatus;
}

export interface ScheduleItem {
  task_id: string;
  task_title: string;
  start_time: string;
  end_time: string;
}

export interface ScheduleOutput {
  schedule: ScheduleItem[];
}

