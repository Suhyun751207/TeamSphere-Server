import { MongoReadStatusModel, MongoReadStatusDocument } from '@models/MongoReadStatus';
import { CreateMongoReadStatusRequest, UpdateMongoReadStatusRequest } from '@interfaces/MongoReadStatus';

export class MongoReadStatusService {
  // 읽음 상태 생성 또는 업데이트
  async updateReadStatus(data: CreateMongoReadStatusRequest): Promise<MongoReadStatusDocument> {
    try {
      const readStatus = await MongoReadStatusModel.findOneAndUpdate(
        { roomId: data.roomId, userId: data.userId },
        {
          lastReadMessageId: data.lastReadMessageId,
          lastReadAt: data.lastReadAt || new Date(),
          updatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
      return readStatus!;
    } catch (error) {
      throw new Error(`Failed to update read status: ${error}`);
    }
  }

  // 사용자의 특정 방 읽음 상태 조회
  async getReadStatus(roomId: string, userId: number): Promise<MongoReadStatusDocument | null> {
    try {
      return await MongoReadStatusModel.findOne({ roomId, userId });
    } catch (error) {
      throw new Error(`Failed to get read status: ${error}`);
    }
  }

  // 사용자의 모든 방 읽음 상태 조회
  async getUserReadStatuses(userId: number): Promise<MongoReadStatusDocument[]> {
    try {
      return await MongoReadStatusModel.find({ userId });
    } catch (error) {
      throw new Error(`Failed to get user read statuses: ${error}`);
    }
  }

  // 특정 방의 모든 사용자 읽음 상태 조회
  async getRoomReadStatuses(roomId: string): Promise<MongoReadStatusDocument[]> {
    try {
      return await MongoReadStatusModel.find({ roomId });
    } catch (error) {
      throw new Error(`Failed to get room read statuses: ${error}`);
    }
  }

  // 읽음 상태 삭제
  async deleteReadStatus(roomId: string, userId: number): Promise<boolean> {
    try {
      const result = await MongoReadStatusModel.findOneAndDelete({ roomId, userId });
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete read status: ${error}`);
    }
  }
}
