import { createTypeGuard } from "type-wizard";
import { workspaceTeamCreate } from "../workspaceTeams.ts";

export const isWorkspaceTeamCreate=createTypeGuard<workspaceTeamCreate>({
    workspaceId: {type: "number"},
    managerId: {type: "number"}
});
