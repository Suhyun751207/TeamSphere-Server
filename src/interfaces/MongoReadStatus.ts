import { ObjectId } from 'mongodb';

export interface MongoReadStatus {
  _id?: string;
  roomId: string;
  userId: number;
  lastReadMessageId: string;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMongoReadStatusRequest {
  roomId: string;
  userId: number;
  lastReadMessageId: string;
  lastReadAt?: Date;
}

export interface UpdateMongoReadStatusRequest {
  lastReadMessageId?: string;
  lastReadAt?: Date;
}
