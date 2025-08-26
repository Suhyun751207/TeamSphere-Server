import { createTypeGuard } from "type-wizard";
import { MessagesCreate, MessagesUpdate } from "../Messages.ts";
import { chat_type_enum } from "@services/ENUM/chat_type_enum.ts";

export const isMessagesCreate = createTypeGuard<MessagesCreate>({
    chatType: { type: "string", enum: chat_type_enum },
    chatId: { type: "number" },
    name: { type: "string" }
});

export const isMessagesUpdate = createTypeGuard<MessagesUpdate>({
    chatId: { type: "number", optional: true },
    name: { type: "string", optional: true }
}).optional();
