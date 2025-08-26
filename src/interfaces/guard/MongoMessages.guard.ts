import { MongoMessages, CreateMongoMessagesRequest, UpdateMongoMessagesRequest } from '../MongoMessages';
import { ObjectId } from 'mongodb';

export function isMongoMessages(obj: any): obj is MongoMessages {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj._id === undefined || obj._id instanceof ObjectId) &&
    obj.roomId instanceof ObjectId &&
    typeof obj.userId === 'number' &&
    typeof obj.content === 'string' &&
    typeof obj.messageType === 'string' &&
    ['text', 'image', 'file', 'system'].includes(obj.messageType) &&
    (obj.replyToId === undefined || obj.replyToId instanceof ObjectId) &&
    obj.createdAt instanceof Date &&
    (obj.updatedAt === undefined || obj.updatedAt instanceof Date) &&
    typeof obj.isDeleted === 'boolean' &&
    typeof obj.isEdited === 'boolean' &&
    (obj.attachments === undefined || isAttachments(obj.attachments))
  );
}

export function isCreateMongoMessagesRequest(obj: any): obj is CreateMongoMessagesRequest {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.roomId instanceof ObjectId &&
    typeof obj.userId === 'number' &&
    typeof obj.content === 'string' &&
    (obj.messageType === undefined || 
      (typeof obj.messageType === 'string' && ['text', 'image', 'file', 'system'].includes(obj.messageType))) &&
    (obj.replyToId === undefined || obj.replyToId instanceof ObjectId) &&
    (obj.attachments === undefined || isAttachments(obj.attachments))
  );
}

export function isUpdateMongoMessagesRequest(obj: any): obj is UpdateMongoMessagesRequest {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.content === undefined || typeof obj.content === 'string') &&
    (obj.isDeleted === undefined || typeof obj.isDeleted === 'boolean') &&
    (obj.isEdited === undefined || typeof obj.isEdited === 'boolean')
  );
}

function isAttachments(obj: any): boolean {
  return (
    Array.isArray(obj) &&
    obj.every((attachment: any) =>
      attachment &&
      typeof attachment === 'object' &&
      typeof attachment.fileName === 'string' &&
      typeof attachment.fileUrl === 'string' &&
      typeof attachment.fileSize === 'number' &&
      typeof attachment.mimeType === 'string'
    )
  );
}
