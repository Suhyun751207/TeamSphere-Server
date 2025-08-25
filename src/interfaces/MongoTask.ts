export const mongoTaskKeys = [
  'id',
  'task_id',
  'title',
  'content',
  'tags',
  'attachments_path',
  'created_at',
  'updated_at'
] as const;

export interface MongoTask {
  id: number; // auto_increment ID
  task_id: number; // MySQL tasks 테이블 참조
  title: string;
  content?: string;
  tags?: string[] | null;
  attachments_path?: string[] | null;
  created_at: Date;
  updated_at: Date;
}

export type MongoTaskAutoSetKeys = "id" | "created_at" | "updated_at";
export interface MongoTaskCreate extends Omit<MongoTask, MongoTaskAutoSetKeys> {}
export interface MongoTaskUpdate extends Partial<Omit<MongoTask, MongoTaskAutoSetKeys | "task_id">> {}
