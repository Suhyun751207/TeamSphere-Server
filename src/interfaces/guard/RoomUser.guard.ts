import { createTypeGuard } from "type-wizard";
import { RoomUserCreate, RoomUserUpdate } from "../RoomUser.ts";

export const isRoomUserCreate=createTypeGuard<RoomUserCreate>({
    roomId: {type: "number"},
    userId: {type: "number"},
    lastMessageId: {type: "number", nullable: true},
}).optional();

export const isRoomUserUpdate=createTypeGuard<RoomUserUpdate>({
    roomId: {type: "number"},
    userId: {type: "number"},
    lastMessageId: {type: "number", nullable: true},
}).optional();
