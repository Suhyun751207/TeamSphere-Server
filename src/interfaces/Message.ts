import { MessageType } from "@services/ENUM/chat_type_enum.ts";

export const messageKeys = ['id', 'userId', 'content', 'messageType', 'replyToId', 'createdAt', 'updatedAt', 'isDeleted', 'isEdited'] as const;

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

export type MessageAutoSetKeys = "id" | "createdAt" | "updatedAt";

export interface MessageCreate extends Omit<Message, MessageAutoSetKeys> {}
export interface MessageUpdate extends Partial<Omit<Message, MessageAutoSetKeys | "userId">> {}
