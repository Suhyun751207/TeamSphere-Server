import { Router } from "express";
import catchAsyncErrors from "../../../../../utils/catchAsyncErrors.ts";
import { authenticateToken } from "../../../../../middleware/auth.ts";
import { checkWorkspaceAccess, checkWorkspaceAdminOrManager } from "../../../../../middleware/workspaceAuth.ts";
import workspaceTeamService from "../../../../../services/workspaceTeams.ts";
import { isWorkspaceTeamCreate } from "../../../../../interfaces/guard/workspaceTeams.guard.ts";
import workspaceTeamUsersService from "../../../../../services/WorkspaceTeamUsers.ts";
import workspaceMemberService from "../../../../../services/workspacesMembers.ts";
import teamIdRouter from "./[teamId]/route.ts";

const teamRouter = Router({ mergeParams: true });
teamRouter.use("/:teamId", teamIdRouter);

// 모든 팀의 대한 정보를 조회
teamRouter.get('/', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const team = await workspaceTeamService.read(Number(workspaceId));
    return res.status(200).json(team);
}))

// 워크스페이스 관리자, 매니저 권한 가진 사람이 팀 생성
teamRouter.post('/', authenticateToken, checkWorkspaceAdminOrManager, catchAsyncErrors(async (req, res) => {
    const name = req.body.name;
    const userId = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const data = { name, managerId: userId!, workspaceId: Number(workspaceId) };
    if (!isWorkspaceTeamCreate(data)) return res.status(400).json({ message: isWorkspaceTeamCreate.message(data) });
    const teamResult = await workspaceTeamService.create(data);

    const workspaceMember = await workspaceMemberService.readByWorkspacesIdUserId(Number(workspaceId), Number(userId));
    const teamUsersResult = await workspaceTeamUsersService.create({ memberId: workspaceMember[0].id, teamId: teamResult.insertId, role: 'Admin' })

    return res.status(201).json({ teamResult, teamUsersResult });
}))

export default teamRouter;