import { MessagesModel, MessageModel, MessagesDocument, MessageDocument } from '@models/MongoChat.ts';
import { MessagesCreate, MessagesUpdate } from '@interfaces/Messages.ts';

// Messages 서비스 (채팅방 관리)
async function readMessages(): Promise<MessagesDocument[]>;
async function readMessages(id: number): Promise<MessagesDocument | null>;
async function readMessages(id?: number): Promise<MessagesDocument[] | MessagesDocument | null> {
  if (!id) return await MessagesModel.find().sort({ createdAt: -1 });
  return await MessagesModel.findOne({ id });
}

async function readMessagesByChatTypeAndId(chatType: string, chatId: number): Promise<MessagesDocument | null> {
  return await MessagesModel.findOne({ chatType, chatId });
}

async function createMessages(data: MessagesCreate): Promise<MessagesDocument> {
  const messages = new MessagesModel(data);
  return await messages.save();
}

async function updateMessages(id: number, data: MessagesUpdate): Promise<MessagesDocument | null> {
  const result = await MessagesModel.findOneAndUpdate(
    { id },
    { ...data, updatedAt: new Date() },
    { new: true }
  );
  return result as unknown as MessagesDocument | null;
}

async function deleteMessages(id: number): Promise<MessagesDocument | null> {
  const result = await MessagesModel.findOneAndDelete({ id });
  return result as unknown as MessagesDocument | null;
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
  // Messages 관련
  readMessages,
  readMessagesByChatTypeAndId,
  createMessages,
  updateMessages,
  deleteMessages,
  
  // 복합 조회
  readMessagesByChatRoom
};

export default chatService;
