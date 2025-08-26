import { MessageModel, MessageDocument, MessagesModel } from '@models/MongoChat.ts';
import { MessageCreate, MessageUpdate } from '@interfaces/Message.ts';

// Message 서비스 (개별 메시지 관리)
async function readMessage(): Promise<MessageDocument[]>;
async function readMessage(id: number): Promise<MessageDocument | null>;
async function readMessage(id?: number): Promise<MessageDocument[] | MessageDocument | null> {
  if (!id) return await MessageModel.find({ isDeleted: 0 }).sort({ createdAt: -1 });
  return await MessageModel.findOne({ id, isDeleted: 0 });
}

async function readMessagesByUserId(userId: number): Promise<MessageDocument[]> {
  return await MessageModel.find({ userId, isDeleted: 0 }).sort({ createdAt: -1 });
}

async function readMessagesByReplyId(replyToId: number): Promise<MessageDocument[]> {
  return await MessageModel.find({ replyToId, isDeleted: 0 }).sort({ createdAt: 1 });
}

async function createMessage(data: MessageCreate): Promise<MessageDocument> {
  const message = new MessageModel(data);
  return await message.save();
}

async function updateMessage(id: number, data: MessageUpdate): Promise<MessageDocument | null> {
  const updateData = {
    ...data,
    updatedAt: new Date(),
    isEdited: 1
  };
  
  const result = await MessageModel.findOneAndUpdate(
    { id, isDeleted: 0 },
    updateData,
    { new: true }
  );
  return result as unknown as MessageDocument | null;
}

async function deleteMessage(id: number): Promise<MessageDocument | null> {
  const result = await MessageModel.findOneAndUpdate(
    { id, isDeleted: 0 },
    { isDeleted: 1, updatedAt: new Date() },
    { new: true }
  );
  return result as unknown as MessageDocument | null;
}

// 채팅방별 메시지 조회 (Messages와 Message 조인)
async function readMessagesByChatRoom(chatType: string, chatId: number, limit: number = 50): Promise<MessageDocument[]> {
  const chatRoom = await MessagesModel.findOne({ chatType, chatId });
  if (!chatRoom) return [];
  
  return await MessageModel.find({ 
    messagesId: chatRoom.id,
    isDeleted: 0 
  })
    .sort({ createdAt: -1 })
    .limit(limit);
}

const chatService = {
  // Message 관련
  readMessage,
  readMessagesByUserId,
  readMessagesByReplyId,
  createMessage,
  updateMessage,
  deleteMessage,
  
  // 복합 조회
  readMessagesByChatRoom
};

export default chatService;
