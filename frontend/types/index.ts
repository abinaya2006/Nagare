export type TaskCategory = 'focus' | 'admin' | 'creative' | 'health' | 'social';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  done: boolean;
  dueToday: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileComplete: boolean;
  workHoursStart?: string;
  workHoursEnd?: string;
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

export type AppPage = 'login' | 'signup' | 'dashboard';
