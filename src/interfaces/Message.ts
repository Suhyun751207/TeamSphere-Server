import { ChatType, MessageType } from "@services/ENUM/chat_type_enum.ts";

export const messagesKeys = ['id', 'chatType', 'chatId', 'name', 'createdAt', 'updatedAt'] as const;
export const messageKeys = ['id', 'userId', 'content', 'messageType', 'replyToId', 'createdAt', 'updatedAt', 'isDeleted', 'isEdited'] as const;

export interface Messages {
  id: number;
  chatType: ChatType;
  chatId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  userId: number;
  content: string;
  messageType: MessageType | null;
  replyToId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  isDeleted: number;
  isEdited: number;
}

export type MessagesAutoSetKeys = "id" | "createdAt" | "updatedAt";
export type MessageAutoSetKeys = "id" | "createdAt" | "updatedAt";

export interface MessagesCreate extends Omit<Messages, MessagesAutoSetKeys> {}
export interface MessagesUpdate extends Partial<Omit<Messages, MessagesAutoSetKeys | "chatType">> {}

export interface MessageCreate extends Omit<Message, MessageAutoSetKeys> {}
export interface MessageUpdate extends Partial<Omit<Message, MessageAutoSetKeys | "userId">> {}
