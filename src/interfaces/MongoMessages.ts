import { ObjectId } from 'mongodb';

export interface MongoMessages {
  _id?: ObjectId;
  roomId: ObjectId; // rooms._id (MongoDB 참조)
  userId: number; // MySQL users.id
  content: string;
  messageType: 'text' | 'image' | 'file';
  replyToId?: ObjectId; // 다른 메시지 참조 (nullable)
  createdAt: Date;
  updatedAt?: Date | null;
  isDeleted: boolean;
  isEdited: boolean;
}

export interface CreateMongoMessagesRequest {
  roomId: ObjectId;
  userId: number;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  replyToId?: ObjectId;
}

export interface UpdateMongoMessagesRequest {
  content?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
}
