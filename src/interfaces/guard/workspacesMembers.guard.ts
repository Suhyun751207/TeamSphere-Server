import { createTypeGuard } from "type-wizard";
import { workspaceMemberCreate, workspaceMemberUpdate } from "../workspacesMembers.ts";

export const isWorkspaceMemberCreate=createTypeGuard<workspaceMemberCreate>({
    workspaceId: {type: "number"},
    userId: {type: "number"},
    role: {type: "string"}
});

export const isWorkspaceMemberUpdate=createTypeGuard<workspaceMemberUpdate>({
    workspaceId: {type: "number", optional: true},
    userId: {type: "number", optional: true},
    role: {type: "string", optional: true}
}).optional();