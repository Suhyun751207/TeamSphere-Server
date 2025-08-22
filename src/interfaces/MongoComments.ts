export const mongoCommentsKeys = [
  '_id',
  'taskId',
  'userId',
  'content',
  'parentCommentId',
  'mentions',
  'attachments',
  'isEdited',
  'editHistory',
  'createdAt',
  'updatedAt'
] as const;

export interface MongoComments {
  taskId: string; // MongoTask의 _id 참조
  userId: number; // MySQL users 테이블의 id 참조
  content: string;
  parentCommentId?: string; // 대댓글을 위한 부모 댓글 ID
  mentions?: number[]; // 멘션된 사용자 ID 배열
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: Date;
  }[];
  isEdited: boolean;
  editHistory?: {
    content: string;
    editedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export type MongoCommentsAutoSetKeys = "createdAt" | "updatedAt" | "isEdited";
export interface MongoCommentsCreate extends Omit<MongoComments, MongoCommentsAutoSetKeys> {}
export interface MongoCommentsUpdate extends Partial<Omit<MongoComments, MongoCommentsAutoSetKeys | "taskId" | "userId">> {}
