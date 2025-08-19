import { createTypeGuard } from "type-wizard";
import { workspaceMemberCreate } from "../workspacesMembers.ts";

export const isWorkspaceMemberCreate=createTypeGuard<workspaceMemberCreate>({
    workspaceId: {type: "number"},
    userId: {type: "number"},
    role: {type: "number"}
});
