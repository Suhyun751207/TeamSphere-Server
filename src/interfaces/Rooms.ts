import { RoomType } from "../services/ENUM/room_ENUM.ts";

export const roomsKeys = ['id', 'type', 'roomId', 'title', 'lastMessageId', 'createdAt', 'updatedAt'] as const;
export interface Rooms {
    id: number;
    type: RoomType;
    roomId: number | null;
    title: string | null;
    lastMessageId: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export type RoomsAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface RoomsCreate extends Omit<Rooms, RoomsAutoSetKeys> { };
export interface RoomsUpdate extends Partial<RoomsCreate> { }; 