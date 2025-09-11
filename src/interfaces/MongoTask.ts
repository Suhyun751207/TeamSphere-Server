export const mongoTaskKeys = [
  'id',
  'task_id',
  'workspace_team_user_id',
  'title',
  'content',
  'status',
  'priority',
  'tags',
  'attachments_path',
  'created_at',
  'updated_at'
] as const;

export interface MongoTask {
  id: number; // auto_increment ID
  task_id: number; // MySQL tasks 테이블 참조
  workspace_team_user_id: number; // 팀 멤버 ID
  title: string;
  content?: string;
  status: string; // 작업 상태
  priority: string; // 우선순위
  tags?: string[] | null;
  attachments_path?: string[] | null;
  created_at: Date;
  updated_at: Date;
}

export type MongoTaskAutoSetKeys = "id" | "created_at" | "updated_at";
export interface MongoTaskCreate extends Omit<MongoTask, MongoTaskAutoSetKeys> {}
export interface MongoTaskUpdate extends Partial<Omit<MongoTask, MongoTaskAutoSetKeys | "task_id">> {}
