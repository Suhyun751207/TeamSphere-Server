import { createTypeGuard } from "type-wizard";
import { workspaceTeamCreate } from "../workspaceTeams";

export const isWorkspaceTeamCreate=createTypeGuard<workspaceTeamCreate>({
    name: {type: "string", nullable: true},
    workspaceId: {type: "number"},
    managerId: {type: "number"}
}).optional();
