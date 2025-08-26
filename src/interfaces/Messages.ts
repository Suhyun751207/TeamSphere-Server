import { ChatType } from "@services/ENUM/chat_type_enum.ts";

export const messagesKeys = ['id', 'chatType', 'chatId', 'name', 'createdAt', 'updatedAt'] as const;

export interface Messages {
  id: number;
  chatType: ChatType;
  chatId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessagesAutoSetKeys = "id" | "createdAt" | "updatedAt";

export interface MessagesCreate extends Omit<Messages, MessagesAutoSetKeys> {}
export interface MessagesUpdate extends Partial<Omit<Messages, MessagesAutoSetKeys | "chatType">> {}
