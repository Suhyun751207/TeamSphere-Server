import { MessageType } from "../services/ENUM/message_ENUM.ts";

export const messageKeys = ['id', 'roomId','userId', 'type', 'content', 'imagePath','isEdited', 'isValid', 'createdAt', 'updatedAt'] as const;
export interface Message {
    id: number;
    roomId: number;
    userId: number;
    type: MessageType;
    content: string;
    imagePath: string | null;
    isEdited: boolean;
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type MessageAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface MessageCreate extends Omit<Message, MessageAutoSetKeys> { };
export interface MessageUpdate extends Partial<MessageCreate> { }; 