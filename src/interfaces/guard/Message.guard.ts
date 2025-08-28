import { createTypeGuard } from "type-wizard";
import { MessageCreate, MessageUpdate } from "../message.ts";
import { message_ENUM } from "../../services/ENUM/message_ENUM.ts";

export const isMessageCreate=createTypeGuard<MessageCreate>({
    roomId: {type: "number"},
    userId: {type: "number"},
    type: {type: "string", enum: message_ENUM},
    content: {type: "string"},
    imagePath: {type: "string", nullable: true},
    isEdited: {type: "boolean", nullable: true},
    isValid: {type: "boolean", nullable: true},
}).optional();

export const isMessageUpdate=createTypeGuard<MessageUpdate>({
    roomId: {type: "number", nullable: true},
    userId: {type: "number", nullable: true},
    type: {type: "string", enum: message_ENUM, nullable: true},
    content: {type: "string", nullable: true},
    imagePath: {type: "string", nullable: true},
    isEdited: {type: "boolean", nullable: true},
    isValid: {type: "boolean", nullable: true},
}).optional();