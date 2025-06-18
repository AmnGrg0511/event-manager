export interface Context {
  id: string;
  name: string;
}

export type TaskStatus = 'inbox' | 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  context?: string;
  projectId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
} 