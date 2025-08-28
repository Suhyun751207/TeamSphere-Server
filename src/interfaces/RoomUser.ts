export const roomUserKeys = ['id','roomId','userId','lastMessageId','createdAt'] as const;
export interface RoomUser {
    id: number;
    roomId: number;
    userId: number;
    lastMessageId: number | null;
    createdAt: Date;
}

export type RoomUserAutoSetKeys = "id" | "createdAt"
export interface RoomUserCreate extends Omit<RoomUser, RoomUserAutoSetKeys> { };
export interface RoomUserUpdate extends Partial<RoomUserCreate> { }; 