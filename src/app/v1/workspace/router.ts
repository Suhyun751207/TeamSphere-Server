import { Router } from "express";
import catchAsyncErrors from "../../../utils/catchAsyncErrors.ts";
import { isWorkspaceCreate } from "../../../interfaces/guard/workspaces.guard.ts";
import workspaceService from "../../../services/workspaces.ts";
import { authenticateToken } from "../../../middleware/auth.ts";
import workspaceMemberService from "../../../services/workspacesMembers.ts";
import workspaceIdRouter from "./[workspaceId]/route.ts";

const workspaceRouter = Router({ mergeParams: true });
workspaceRouter.use("/:workspaceId", workspaceIdRouter);


// 자신이 참여하고 있는 워크스페이스의 대한 전체 정보를 조회
workspaceRouter.get("/", authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId!);
    const workspaces = await Promise.all(userWorkspaceMembers.map((member) => {
        return workspaceService.read(member.workspaceId);
    }));
    return res.status(200).json(workspaces);
}));

// 자신이 관리자인 워크스페이스 생성
workspaceRouter.post("/", authenticateToken, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const adminId = req.user?.userId;
    if (!isWorkspaceCreate(body)) return res.status(400).json({ message: isWorkspaceCreate.message(body) });
    const workspaceResult = await workspaceService.create({...body, adminId: adminId!});
    const workspaceMemberResult = await workspaceMemberService.create({workspaceId: workspaceResult.insertId, userId: adminId!, role: "Admin"});
    return res.status(201).json({
        workspace: workspaceResult,
        workspaceMember: workspaceMemberResult
    });
}));

export default workspaceRouter;
