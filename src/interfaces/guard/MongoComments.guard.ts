import { createTypeGuard } from "type-wizard";
import { MongoCommentsCreate, MongoCommentsUpdate } from "../MongoComments.ts";

export const isMongoCommentsCreate = createTypeGuard<MongoCommentsCreate>({
    taskId: { type: "string" },
    userId: { type: "number" },
    content: { type: "string" },
    parentCommentId: { type: "string", optional: true },
    mentions: { type: "array", optional: true, of: { type: "number" } },
    attachments: { type: "array", optional: true, of: { type: "object", of: (v: unknown) => typeof v === "object" } },
    editHistory: { type: "array", optional: true, of: { type: "object", of: (v: unknown) => typeof v === "object" } }
}).optional();

export const isMongoCommentsUpdate = createTypeGuard<MongoCommentsUpdate>({
    content: { type: "string", optional: true },
    parentCommentId: { type: "string", optional: true },
    mentions: { type: "array", optional: true, of: { type: "number" } },
    attachments: { type: "array", optional: true, of: { type: "object", of: (v: unknown) => typeof v === "object" } },
    editHistory: { type: "array", optional: true, of: { type: "object", of: (v: unknown) => typeof v === "object" } }
}).optional();
