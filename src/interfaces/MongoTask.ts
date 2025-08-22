import { TaskPriority } from "@services/ENUM/task_priority_enum.ts";
import { TaskState } from "@services/ENUM/task_states_enum.ts";

export const mongoTaskKeys = [
  '_id',
  'workspaceTeamUserId', 
  'title',
  'description',
  'state',
  'priority',
  'dueDate',
  'assignedTo',
  'createdBy',
  'tags',
  'attachments',
  'createdAt',
  'updatedAt'
] as const;

export interface MongoTask {
  workspaceTeamUserId: number; // MySQL의 workspace_team_users 테이블 참조
  title: string;
  description?: string;
  state: TaskState;
  priority: TaskPriority;
  dueDate?: Date;
  assignedTo?: number[]; // 할당된 사용자 ID 배열
  createdBy: number; // 작성자 user_id
  tags?: string[];
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export type MongoTaskAutoSetKeys = "createdAt" | "updatedAt";
export interface MongoTaskCreate extends Omit<MongoTask, MongoTaskAutoSetKeys> {}
export interface MongoTaskUpdate extends Partial<Omit<MongoTask, MongoTaskAutoSetKeys | "workspaceTeamUserId" | "createdBy">> {}
