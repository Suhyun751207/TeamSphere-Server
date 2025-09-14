import { createTypeGuard } from "type-wizard";
import { ActivityLogsCreate } from "../ActivityLogs";

export const isActivityLogsCreate=createTypeGuard<ActivityLogsCreate>({
    userId: {type: "number"},
    workspaceId: {type: "number"},
    message: {type: "string"},
});
