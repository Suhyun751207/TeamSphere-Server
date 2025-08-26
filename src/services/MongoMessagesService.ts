import { MongoMessagesModel, MongoMessagesDocument } from '@models/MongoMessages';
import { MongoRoomsService } from './MongoRoomsService';
import { CreateMongoMessagesRequest, UpdateMongoMessagesRequest } from '@interfaces/MongoMessages';
import { redisService } from '@config/redis';
import { ObjectId } from 'mongodb';

export class MongoMessagesService {
  private roomsService: MongoRoomsService;

  constructor() {
    this.roomsService = new MongoRoomsService();
  }

  // 메시지 생성
  async createMessage(data: CreateMongoMessagesRequest): Promise<MongoMessagesDocument> {
    try {
      const message = new MongoMessagesModel({
        ...data,
        messageType: data.messageType || 'text',
        createdAt: new Date(),
        isDeleted: false,
        isEdited: false
      });
      
      const savedMessage = await message.save();
      
      // 채팅방의 마지막 메시지 업데이트
      await this.roomsService.updateLastMessage(
        data.roomId.toString(),
        savedMessage._id,
        data.content,
        data.userId
      );
      
      // Redis를 통한 실시간 메시지 전송
      try {
        const roomChannel = redisService.getRoomChannel(data.roomId.toString());
        await redisService.publishMessage(roomChannel, {
          type: 'new_message',
          message: savedMessage,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Failed to publish message to Redis:', error);
      }
      
      return savedMessage;
    } catch (error) {
      throw new Error(`Failed to create message: ${error}`);
    }
  }

  // 메시지 조회 (ID로)
  async getMessageById(messageId: string): Promise<MongoMessagesDocument | null> {
    try {
      return await MongoMessagesModel.findById(messageId).populate('replyToId');
    } catch (error) {
      throw new Error(`Failed to get message: ${error}`);
    }
  }

  // 채팅방의 메시지 목록 조회
  async getMessagesByRoomId(roomId: string, page: number = 1, limit: number = 50): Promise<{
    messages: MongoMessagesDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const messages = await MongoMessagesModel
        .find({ roomId, isDeleted: false })
        .populate('replyToId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await MongoMessagesModel.countDocuments({ roomId, isDeleted: false });
      const totalPages = Math.ceil(total / limit);

      return { messages: messages.reverse(), total, page, totalPages };
    } catch (error) {
      throw new Error(`Failed to get messages by roomId: ${error}`);
    }
  }

  // 사용자의 메시지 목록 조회
  async getMessagesByUserId(userId: number, page: number = 1, limit: number = 50): Promise<{
    messages: MongoMessagesDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const messages = await MongoMessagesModel
        .find({ userId, isDeleted: false })
        .populate('replyToId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await MongoMessagesModel.countDocuments({ userId, isDeleted: false });
      const totalPages = Math.ceil(total / limit);

      return { messages, total, page, totalPages };
    } catch (error) {
      throw new Error(`Failed to get messages by userId: ${error}`);
    }
  }

  // 메시지 수정
  async updateMessage(messageId: string, data: UpdateMongoMessagesRequest): Promise<MongoMessagesDocument | null> {
    try {
      return await MongoMessagesModel.findByIdAndUpdate(
        messageId,
        data,
        { new: true }
      ).populate('replyToId');
    } catch (error) {
      throw new Error(`Failed to update message: ${error}`);
    }
  }

  // 메시지 삭제 (소프트 삭제)
  async deleteMessage(messageId: string): Promise<MongoMessagesDocument | null> {
    try {
      return await MongoMessagesModel.findByIdAndUpdate(
        messageId,
        { isDeleted: true, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to delete message: ${error}`);
    }
  }

  // 메시지 완전 삭제
  async permanentDeleteMessage(messageId: string): Promise<boolean> {
    try {
      const result = await MongoMessagesModel.findByIdAndDelete(messageId);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to permanently delete message: ${error}`);
    }
  }

  // 답글 메시지 조회
  async getRepliesByMessageId(messageId: string): Promise<MongoMessagesDocument[]> {
    try {
      return await MongoMessagesModel
        .find({ replyToId: messageId, isDeleted: false })
        .sort({ createdAt: 1 });
    } catch (error) {
      throw new Error(`Failed to get replies: ${error}`);
    }
  }

  // 메시지 검색
  async searchMessages(roomId: string, query: string, page: number = 1, limit: number = 20): Promise<{
    messages: MongoMessagesDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(query, 'i');
      
      const messages = await MongoMessagesModel
        .find({ 
          roomId, 
          content: searchRegex,
          isDeleted: false 
        })
        .populate('replyToId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await MongoMessagesModel.countDocuments({ 
        roomId, 
        content: searchRegex,
        isDeleted: false 
      });
      const totalPages = Math.ceil(total / limit);

      return { messages, total, page, totalPages };
    } catch (error) {
      throw new Error(`Failed to search messages: ${error}`);
    }
  }

  // 첨부파일이 있는 메시지 조회
  async getMessagesWithAttachments(roomId: string, page: number = 1, limit: number = 20): Promise<{
    messages: MongoMessagesDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const messages = await MongoMessagesModel
        .find({ 
          roomId,
          attachments: { $exists: true, $ne: [] },
          isDeleted: false 
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await MongoMessagesModel.countDocuments({ 
        roomId,
        attachments: { $exists: true, $ne: [] },
        isDeleted: false 
      });
      const totalPages = Math.ceil(total / limit);

      return { messages, total, page, totalPages };
    } catch (error) {
      throw new Error(`Failed to get messages with attachments: ${error}`);
    }
  }
}
