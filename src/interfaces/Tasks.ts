import { TaskPriority } from "../services/ENUM/task_priority_enum.ts";
import { TaskState } from "../services/ENUM/task_states_enum.ts";

export const tasksKeys = ['id', 'teamMemberId', 'state', 'priority', 'task', 'externalId', 'createdAt', 'updatedAt'] as const;
export interface tasks {
  id: number;
  teamMemberId: number;
  state: TaskState;
  priority: TaskPriority;
  task: string | null;
  externalId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type tasksAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface tasksCreate extends Omit<tasks, tasksAutoSetKeys> { };
export interface tasksUpdate extends Partial<tasksCreate> { }; 