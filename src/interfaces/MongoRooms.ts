import { ObjectId } from 'mongodb';

export interface MongoRooms {
  _id?: ObjectId;
  type: 'dm' | 'workspace' | 'team';
  chatId: number; // MySQL의 dm.id / workspace.id / team.id 등
  participants: number[]; // users.id (MySQL PK 배열)
  name?: string; // 선택적 (워크스페이스/팀에만 사용)
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    messageId: ObjectId;
    content: string;
    createdAt: Date;
    userId: number;
  };
}

export interface CreateMongoRoomsRequest {
  type: 'dm' | 'workspace' | 'team';
  chatId: number;
  participants: number[];
  name?: string;
}

export interface UpdateMongoRoomsRequest {
  name?: string;
  participants?: number[];
  lastMessage?: {
    messageId: ObjectId;
    content: string;
    createdAt: Date;
    userId: number;
  };
}
