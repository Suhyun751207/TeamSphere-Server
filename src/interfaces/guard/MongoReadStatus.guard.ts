import { CreateMongoReadStatusRequest, UpdateMongoReadStatusRequest } from '../MongoReadStatus';

export function isCreateMongoReadStatusRequest(obj: any): obj is CreateMongoReadStatusRequest {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.roomId === 'string' &&
    typeof obj.userId === 'number' &&
    typeof obj.lastReadMessageId === 'string' &&
    (obj.lastReadAt === undefined || obj.lastReadAt instanceof Date)
  );
}

export function isUpdateMongoReadStatusRequest(obj: any): obj is UpdateMongoReadStatusRequest {
  return (
    obj &&
    typeof obj === 'object' &&
    (obj.lastReadMessageId === undefined || typeof obj.lastReadMessageId === 'string') &&
    (obj.lastReadAt === undefined || obj.lastReadAt instanceof Date)
  );
}
