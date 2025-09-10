import { createTypeGuard } from "type-wizard";
import { RoomsCreate, RoomsUpdate } from "../Rooms.ts";
import { room_ENUM } from "../../services/ENUM/room_ENUM.ts";

export const isRoomsCreate=createTypeGuard<RoomsCreate>({
    roomId: {type: "number", nullable: true },
    type: {type: "string", enum: room_ENUM},
    title: {type: "string", nullable: true },
    workspaceId: {type: "number", nullable: true },
    lastMessageId: {type: "number", nullable: true },
}).optional();

export const isRoomsUpdate=createTypeGuard<RoomsUpdate>({
    roomId: {type: "number", nullable: true },
    type: {type: "string", enum: room_ENUM},
    title: {type: "string", nullable: true },
    workspaceId: {type: "number", nullable: true },
    lastMessageId: {type: "number", nullable: true },
}).optional();
