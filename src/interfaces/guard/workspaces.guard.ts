import { createTypeGuard } from "type-wizard";
import { WorkspaceCreate } from "../workspaces.ts";

export const isWorkspaceCreate=createTypeGuard<WorkspaceCreate>({
    adminId: {type: "number"},
    name: {type: "string", nullable: true},
    description: {type: "string", nullable: true}
}).optional();
