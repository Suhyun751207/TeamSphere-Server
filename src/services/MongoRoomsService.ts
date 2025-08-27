import { MongoRoomsModel, MongoRoomsDocument } from '@models/MongoRooms';
import { CreateMongoRoomsRequest, UpdateMongoRoomsRequest } from '@interfaces/MongoRooms';
import { ObjectId } from 'mongodb';

export class MongoRoomsService {
  // 채팅방 생성
  async createRoom(data: CreateMongoRoomsRequest): Promise<MongoRoomsDocument> {
    try {
      // DM 타입의 경우 participants 배열을 정렬하여 일관성 보장
      if (data.type === 'dm' && data.participants) {
        data.participants = data.participants.sort((a, b) => a - b);
      }
      
      const room = new MongoRoomsModel({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return await room.save();
    } catch (error) {
      throw new Error(`Failed to create room: ${error}`);
    }
  }

  // 채팅방 조회 (ID로)
  async getRoomById(roomId: ObjectId | string): Promise<MongoRoomsDocument | null> {
    try {
      return await MongoRoomsModel.findById(roomId);
    } catch (error) {
      throw new Error(`Failed to get room: ${error}`);
    }
  }

  // 채팅방 조회 (type과 chatId로)
  async getRoomByTypeAndChatId(type: string, chatId: number): Promise<MongoRoomsDocument | null> {
    try {
      return await MongoRoomsModel.findOne({ type, chatId });
    } catch (error) {
      throw new Error(`Failed to get room by type and chatId: ${error}`);
    }
  }

  // 사용자가 참여한 채팅방 목록 조회
  async getRoomsByUserId(userId: number, page: number = 1, limit: number = 20): Promise<{
    rooms: MongoRoomsDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const rooms = await MongoRoomsModel
        .find({ participants: userId })
        .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await MongoRoomsModel.countDocuments({ participants: userId });
      const totalPages = Math.ceil(total / limit);

      return { rooms, total, page, totalPages };
    } catch (error) {
      throw new Error(`Failed to get rooms by userId: ${error}`);
    }
  }

  // 채팅방 정보 업데이트
  async updateRoom(roomId: string, data: UpdateMongoRoomsRequest): Promise<MongoRoomsDocument | null> {
    try {
      return await MongoRoomsModel.findByIdAndUpdate(
        roomId,
        { ...data, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to update room: ${error}`);
    }
  }


  // 채팅방 참여자 추가
  async addParticipant(roomId: string, userId: number): Promise<MongoRoomsDocument | null> {
    try {
      return await MongoRoomsModel.findByIdAndUpdate(
        roomId,
        { 
          $addToSet: { participants: userId },
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to add participant: ${error}`);
    }
  }

  // 채팅방 참여자 제거
  async removeParticipant(roomId: string, userId: number): Promise<MongoRoomsDocument | null> {
    try {
      return await MongoRoomsModel.findByIdAndUpdate(
        roomId,
        { 
          $pull: { participants: userId },
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to remove participant: ${error}`);
    }
  }

  // 채팅방 삭제
  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      const result = await MongoRoomsModel.findByIdAndDelete(roomId);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete room: ${error}`);
    }
  }

  // 사용자가 참여한 특정 타입의 채팅방 목록 조회
  async getRoomsByUserAndType(userId: number, type: 'dm' | 'workspace' | 'team'): Promise<MongoRoomsDocument[]> {
    try {
      return await MongoRoomsModel
        .find({ participants: userId, type })
        .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 });
    } catch (error) {
      throw new Error(`Failed to get rooms by user and type: ${error}`);
    }
  }

  // DM 채팅방 찾기 (두 사용자 간)
  async findDMRoom(userId1: number, userId2: number): Promise<MongoRoomsDocument | null> {
    try {
      // participants 배열을 정렬하여 일관성 보장
      const sortedParticipants = [userId1, userId2].sort((a, b) => a - b);
      return await MongoRoomsModel.findOne({
        type: 'dm',
        participants: { $all: sortedParticipants, $size: 2 }
      });
    } catch (error) {
      throw new Error(`Failed to find DM room: ${error}`);
    }
  }

  // 마지막 메시지 업데이트 (새로운 시그니처)
  async updateLastMessage(roomId: ObjectId | string, lastMessage: {
    messageId: ObjectId;
    content: string;
    createdAt: Date;
    userId: number;
  }): Promise<MongoRoomsDocument | null> {
    try {
      return await MongoRoomsModel.findByIdAndUpdate(
        roomId,
        {
          lastMessage,
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to update last message: ${error}`);
    }
  }
}
