import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { isWorkspaceCreate } from "@interfaces/guard/workspaces.guard.ts";
import workspaceService from "@services/workspaces.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkWorkspaceAccess, checkWorkspaceAdminOrManager } from "@middleware/workspaceAuth.ts";
import workspaceMemberService from "@services/workspacesMembers.ts";
import workspaceIdMemberRouter from "./members/route.ts";
import activityLogsRouter from "./activityLogs/route.ts";
import teamRouter from "./Teams/route.ts";
import messageRouter from "./message/route.ts";

const workspaceIdRouter = Router({ mergeParams: true });
workspaceIdRouter.use("/members", workspaceIdMemberRouter);
workspaceIdRouter.use("/activityLog", activityLogsRouter);
workspaceIdRouter.use("/teams", teamRouter);
workspaceIdRouter.use("/message", messageRouter);

// 워크스페이스의 대한 정보를 조회
workspaceIdRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const workspace = await workspaceService.read(Number(workspaceId));
    const workspaceMember = await workspaceMemberService.read(Number(workspaceId));
    return res.status(200).json({workspace, workspaceMember});
}));

// 워크스페이스 수정
workspaceIdRouter.patch("/", authenticateToken, checkWorkspaceAdminOrManager, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const adminId = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const data = { ...body, adminId: adminId! };
    if (!isWorkspaceCreate(data)) return res.status(400).json({ message: isWorkspaceCreate.message(data) });
    const workspace = await workspaceService.update(Number(workspaceId), data);
    return res.status(200).json(workspace);
}));

export default workspaceIdRouter;
