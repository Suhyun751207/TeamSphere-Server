import { createTypeGuard } from "type-wizard";
import { MongoTaskCreate, MongoTaskUpdate } from "@interfaces/MongoTask.ts";

export const isMongoTaskCreate = createTypeGuard<MongoTaskCreate>({
    task_id: { type: "number" },
    title: { type: "string" },
    content: { type: "string", optional: true },
    tags: { type: "array", optional: true, of: { type: "string" }, nullable: true },
    attachments_path: { type: "array", optional: true, of: { type: "string" }, nullable: true }
}).optional();

export const isMongoTaskUpdate = createTypeGuard<MongoTaskUpdate>({
    title: { type: "string", optional: true },
    content: { type: "string", optional: true },
    tags: { type: "array", optional: true, of: { type: "string" }, nullable: true },
    attachments_path: { type: "array", optional: true, of: { type: "string" }, nullable: true  }
}).optional();
