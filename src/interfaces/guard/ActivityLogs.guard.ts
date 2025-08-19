import { createTypeGuard } from "type-wizard";
import { ActivityLogsCreate } from "../ActivityLogs.ts";

export const isActivityLogsCreate=createTypeGuard<ActivityLogsCreate>({
    userId: {type: "number"},
    workspaceId: {type: "number"},
    message: {type: "string"},
});
