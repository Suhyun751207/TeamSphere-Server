import { ObjectId } from 'mongodb';

export interface MongoMessages {
  _id?: ObjectId;
  roomId: ObjectId; // rooms._id (MongoDB 참조)
  userId: number; // MySQL users.id
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  replyToId?: ObjectId; // 다른 메시지 참조 (nullable)
  createdAt: Date;
  updatedAt?: Date;
  isDeleted: boolean;
  isEdited: boolean;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
}

export interface CreateMongoMessagesRequest {
  roomId: ObjectId;
  userId: number;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  replyToId?: ObjectId;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
}

export interface UpdateMongoMessagesRequest {
  content?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
}
