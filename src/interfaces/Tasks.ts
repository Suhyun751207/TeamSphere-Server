import { TaskPriority } from "../services/ENUM/task_priority_enum.ts";
import { TaskState } from "../services/ENUM/task_states_enum.ts";

export const tasksKeys=['teamMemberId','state','priority','task','createdAt','updatedAt'] as const;
export interface tasks {
  teamMemberId:number;
  state:TaskState;
  priority:TaskPriority;
  task:string | null;
  createdAt:Date;
  updatedAt:Date;
}

export type tasksAutoSetKeys="createdAt"|"updatedAt"
export interface tasksCreate extends Omit<tasks, tasksAutoSetKeys>{};
export interface tasksUpdate extends Partial<tasksCreate>{}; 