import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { isWorkspaceTeamUserCreate } from "@interfaces/guard/WorkspaceTeamUsers.guard.ts";
import { WorkspaceRole } from "@services/ENUM/workspace_roles_enum.ts";
import teamIdMemberIdRouter from "./[memberId]/route.ts";
import workspaceMemberService from "@services/workspacesMembers.ts";
import profilesService from "@services/Profiles.ts";

const teamIdMemberRouter = Router({ mergeParams: true });
teamIdMemberRouter.use("/:memberId", teamIdMemberIdRouter);

// 팀 멤버 조회
teamIdMemberRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const teamMembers = await workspaceTeamUsersService.readByTeamId(teamId);

    const teamMembersWithUserInfo = await Promise.all(
        teamMembers.map(async (teamMember) => {
            const workspaceMember = await workspaceMemberService.readById(teamMember.memberId);
            const userId = workspaceMember[0]?.userId;
            const profile = await profilesService.read(userId);
            return {
                ...teamMember,
                workspaceMember: workspaceMember[0] || null,
                profile: profile || null
            };
        })
    );

    return res.status(200).json(teamMembersWithUserInfo);
}))

// 팀 멤버 추가
teamIdMemberRouter.post('/', authenticateToken, checkTeamAdminOrManager, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const memberId = Number(req.body.memberId);
    const role: WorkspaceRole = req.body.role;
    const data = { teamId, memberId, role };
    if (!isWorkspaceTeamUserCreate(data)) return res.status(400).json({ message: isWorkspaceTeamUserCreate.message(data) });
    const existingTeamMembers = await workspaceTeamUsersService.readByTeamId(teamId);
    const isMemberAlreadyInTeam = existingTeamMembers.some(member => member.memberId === memberId);
    if (isMemberAlreadyInTeam) {
        return res.status(400).json({ message: "이미 팀에 추가된 멤버입니다." });
    }
    const teamMember = await workspaceTeamUsersService.create(data);
    return res.status(200).json({ teamMember });
}))



export default teamIdMemberRouter;