import { createTypeGuard } from "type-wizard";
import { MongoTaskCreate, MongoTaskUpdate } from "../MongoTask.ts";

export const isMongoTaskCreate = createTypeGuard<MongoTaskCreate>({
    workspaceTeamUserId: { type: "number" },
    title: { type: "string" },
    description: { type: "string", optional: true },
    state: { type: "string" },
    priority: { type: "string" },
    dueDate: { type: "object", optional: true, of: (v: unknown) => v instanceof Date },
    assignedTo: { type: "array", optional: true, of: { type: "number" } },
    createdBy: { type: "number" },
    tags: { type: "array", optional: true, of: { type: "string" } },
    attachments: { type: "array", optional: true, of: { type: "object", of: (v: unknown) => typeof v === "object" } }
}).optional();

export const isMongoTaskUpdate = createTypeGuard<MongoTaskUpdate>({
    title: { type: "string", optional: true },
    description: { type: "string", optional: true },
    state: { type: "string", optional: true },
    priority: { type: "string", optional: true },
    dueDate: { type: "object", optional: true, of: (v: unknown) => v instanceof Date },
    assignedTo: { type: "array", optional: true, of: { type: "number" } },
    tags: { type: "array", optional: true, of: { type: "string" } },
    attachments: { type: "array", optional: true, of: { type: "object", of: (v: unknown) => typeof v === "object" } }
}).optional();
