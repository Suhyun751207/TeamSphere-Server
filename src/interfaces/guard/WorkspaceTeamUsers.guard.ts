import { createTypeGuard } from "type-wizard";
import { UserCreate } from "../WorkspaceTeamUsers.ts";

export const isUserCreate=createTypeGuard<UserCreate>({
    memberId: {type: "number"},
    teamId: {type: "number"},
    role: {type: "string"}
});
