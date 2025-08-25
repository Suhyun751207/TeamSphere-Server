import { createTypeGuard } from "type-wizard";
import { MongoCommentsCreate, MongoCommentsUpdate } from "@interfaces/MongoComments.ts";

export const isMongoCommentsCreate = createTypeGuard<MongoCommentsCreate>({
    task_id: { type: "number" },
    member_id: { type: "number" },
    content: { type: "string" },
    parent_id: { type: "number", optional: true, nullable: true }
}).optional();

export const isMongoCommentsUpdate = createTypeGuard<MongoCommentsUpdate>({
    content: { type: "string" }
});
