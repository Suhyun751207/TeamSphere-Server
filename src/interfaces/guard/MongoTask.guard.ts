import { createTypeGuard } from "type-wizard";
import { MongoTaskCreate, MongoTaskUpdate } from "@interfaces/MongoTask";

export const isMongoTaskCreate = createTypeGuard<MongoTaskCreate>({
    task_id: { type: "number" },
    workspace_team_user_id: { type: "number" },
    title: { type: "string" },
    content: { type: "string", optional: true },
    status: { type: "string" },
    priority: { type: "string" },
    tags: { type: "array", optional: true, of: { type: "string" }, nullable: true },
    attachments_path: { type: "array", optional: true, of: { type: "string" }, nullable: true }
}).optional();

export const isMongoTaskUpdate = createTypeGuard<MongoTaskUpdate>({
    workspace_team_user_id: { type: "number", optional: true },
    title: { type: "string", optional: true },
    content: { type: "string", optional: true },
    status: { type: "string", optional: true },
    priority: { type: "string", optional: true },
    tags: { type: "array", optional: true, of: { type: "string" }, nullable: true },
    attachments_path: { type: "array", optional: true, of: { type: "string" }, nullable: true  }
}).optional();
