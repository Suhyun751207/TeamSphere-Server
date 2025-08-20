import { Router } from "express";
import catchAsyncErrors from "../../../../utils/catchAsyncErrors.ts";
import { isWorkspaceCreate } from "../../../../interfaces/guard/workspaces.guard.ts";
import workspaceService from "../../../../services/workspaces.ts";
import { authenticateToken } from "../../../../middleware/auth.ts";
import { checkWorkspaceAccess } from "../../../../middleware/workspaceAuth.ts";
import workspaceMemberService from "../../../../services/workspacesMembers.ts";
import workspaceIdMemberRouter from "./members/route.ts";
import activityLogsRouter from "./activityLogs/route.ts";
import teamRouter from "./Teams/route.ts";

const workspaceIdRouter = Router({ mergeParams: true });
workspaceIdRouter.use("/members", workspaceIdMemberRouter);
workspaceIdRouter.use("/activityLog", activityLogsRouter);
workspaceIdRouter.use("/teams", teamRouter);

// 워크스페이스의 대한 정보를 조회
workspaceIdRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const workspace = await workspaceService.read(Number(workspaceId));
    const workspaceMember = await workspaceMemberService.read(Number(workspaceId));
    return res.status(200).json({workspace, workspaceMember});
}));

export default workspaceIdRouter;
