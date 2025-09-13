export const mongoCommentsKeys = [
  'id',
  'task_id',
  'workspace_team_user_id',
  'parent_id',
  'content',
  'created_at',
  'updated_at'
] as const;

export interface MongoComments {
  id: number; // auto_increment ID
  task_id: number; // MongoTask의 id 참조 (FK)
  workspace_team_user_id: number; // MySQL users 테이블의 id 참조
  parent_id?: number | null; // 대댓글을 위한 부모 댓글 ID
  content: string;
  created_at: Date;
  updated_at: Date;
}

export type MongoCommentsAutoSetKeys = "id" | "created_at" | "updated_at";
export interface MongoCommentsCreate extends Omit<MongoComments, MongoCommentsAutoSetKeys> {}
export interface MongoCommentsUpdate extends Partial<Omit<MongoComments, MongoCommentsAutoSetKeys | "task_id" | "workspace_team_user_id" | "parent_id">> {}
