import { createTypeGuard } from "type-wizard";
import { WorkspaceTeamUsersCreate } from "../WorkspaceTeamUsers";

export const isWorkspaceTeamUserCreate=createTypeGuard<WorkspaceTeamUsersCreate>({
    memberId: {type: "number"},
    teamId: {type: "number"},
    role: {type: "string"}
});
