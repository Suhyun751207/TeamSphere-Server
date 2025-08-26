import { createTypeGuard } from "type-wizard";
import { MessageCreate, MessageUpdate } from "../Message.ts";
import { message_type_enum } from "@services/ENUM/chat_type_enum.ts";

export const isMessageCreate = createTypeGuard<MessageCreate>({
    userId: { type: "number" },
    content: { type: "string" },
    messageType: { type: "string", enum: message_type_enum, nullable: true },
    replyToId: { type: "number", nullable: true },
    isDeleted: { type: "number" },
    isEdited: { type: "number" }
});

export const isMessageUpdate = createTypeGuard<MessageUpdate>({
    content: { type: "string", optional: true },
    messageType: { type: "string", enum: message_type_enum, nullable: true, optional: true },
    replyToId: { type: "number", nullable: true, optional: true },
    isDeleted: { type: "number", optional: true },
    isEdited: { type: "number", optional: true }
}).optional();
