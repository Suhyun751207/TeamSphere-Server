import { createTypeGuard } from "type-wizard";
import { UserCreate } from "../WorkspaceTeamUsers.ts";

export const isUserCreate=createTypeGuard<UserCreate>({
    memberId: {type: "string"},
    teamId: {type: "string"},
    role: {type: "string"}
});
