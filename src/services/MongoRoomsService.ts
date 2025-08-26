import { MongoRoomsModel, MongoRoomsDocument } from '@models/MongoRooms';
import { CreateMongoRoomsRequest, UpdateMongoRoomsRequest } from '@interfaces/MongoRooms';
import { ObjectId } from 'mongodb';

export class MongoRoomsService {
  // 채팅방 생성
  async createRoom(data: CreateMongoRoomsRequest): Promise<MongoRoomsDocument> {
    try {
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
  async getRoomById(roomId: string): Promise<MongoRoomsDocument | null> {
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

  // 마지막 메시지 업데이트
  async updateLastMessage(roomId: string, messageId: ObjectId, content: string, userId: number): Promise<MongoRoomsDocument | null> {
    try {
      return await MongoRoomsModel.findByIdAndUpdate(
        roomId,
        {
          lastMessage: {
            messageId,
            content,
            createdAt: new Date(),
            userId
          },
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to update last message: ${error}`);
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
}
