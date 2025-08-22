import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkWorkspaceAccess } from "@middleware/workspaceAuth.ts";
import activityLogsService from "@services/ActivityLogs.ts";
import { isActivityLogsCreate } from "@interfaces/guard/ActivityLogs.guard.ts";
import workspaceMemberService from "@services/workspacesMembers.ts";

const activityLogsRouter = Router({ mergeParams: true });

activityLogsRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const activityLogs = await activityLogsService.read(Number(workspaceId));
    return res.status(200).json(activityLogs);
}));

activityLogsRouter.post("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;
    const workspaceMember = await workspaceMemberService.readByWorkspacesIdUserId(Number(workspaceId), Number(userId));
    const data = { ...body, workspaceId: Number(workspaceId), userId: workspaceMember[0].id };
    if (!isActivityLogsCreate(data)) return res.status(400).json({ message: isActivityLogsCreate.message(data) });
    const activityLogResult = await activityLogsService.create(data);
    return res.status(201).json(activityLogResult);
}));

export default activityLogsRouter;
