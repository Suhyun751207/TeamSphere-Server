import { MongoRooms, CreateMongoRoomsRequest, UpdateMongoRoomsRequest } from '../MongoRooms';
import { ObjectId } from 'mongodb';

export function isMongoRooms(obj: any): obj is MongoRooms {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj._id === undefined || obj._id instanceof ObjectId) &&
    typeof obj.type === 'string' &&
    ['dm', 'workspace', 'team'].includes(obj.type) &&
    (typeof obj.chatId === 'number' || obj.chatId === null) &&
    Array.isArray(obj.participants) &&
    obj.participants.every((p: any) => typeof p === 'number') &&
    (obj.name === undefined || typeof obj.name === 'string') &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    (obj.lastMessage === undefined || isLastMessage(obj.lastMessage))
  );
}

export function isCreateMongoRoomsRequest(obj: any): obj is CreateMongoRoomsRequest {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    ['dm', 'workspace', 'team'].includes(obj.type) &&
    (typeof obj.chatId === 'number' || obj.chatId === null) &&
    Array.isArray(obj.participants) &&
    obj.participants.every((p: any) => typeof p === 'number') &&
    (obj.name === undefined || typeof obj.name === 'string')
  );
}

export function isUpdateMongoRoomsRequest(obj: any): obj is UpdateMongoRoomsRequest {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.name === undefined || typeof obj.name === 'string') &&
    (obj.participants === undefined || 
      (Array.isArray(obj.participants) && obj.participants.every((p: any) => typeof p === 'number'))) &&
    (obj.lastMessage === undefined || isLastMessage(obj.lastMessage))
  );
}

function isLastMessage(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.messageId instanceof ObjectId &&
    typeof obj.content === 'string' &&
    obj.createdAt instanceof Date &&
    typeof obj.userId === 'number'
  );
}
