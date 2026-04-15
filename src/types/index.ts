
export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: Date;
  priority: Priority;
  subtasks: Subtask[];
}

export type ViewMode = 'month' | 'week' | 'day';
