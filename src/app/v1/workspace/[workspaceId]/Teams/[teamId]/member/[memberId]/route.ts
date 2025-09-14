import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";
import { isWorkspaceTeamUserCreate } from "@interfaces/guard/WorkspaceTeamUsers.guard";
import { WorkspaceRole } from "@services/ENUM/workspace_roles_enum";
import workspaceMemberService from "@services/workspacesMembers";
import profilesService from "@services/Profiles";

const teamIdMemberIdRouter = Router({ mergeParams: true });

// 특정 팀 멤버 조회
teamIdMemberIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const memberId = Number(req.params.memberId);
    const teamId = Number(req.params.teamId);
    const teamMembers = await workspaceTeamUsersService.readIdAndTeamId(memberId, teamId);

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

// 팀 맴버 역할 수정
teamIdMemberIdRouter.patch('/', authenticateToken, checkTeamAdminOrManager, catchAsyncErrors(async (req, res) => {
    const Id = Number(req.params.memberId);
    const teamId = Number(req.params.teamId);
    const memberId = Number(req.params.memberId);
    const role: WorkspaceRole = req.body.role;
    const data = { teamId, memberId, role };
    if (!isWorkspaceTeamUserCreate(data)) return res.status(400).json({ message: isWorkspaceTeamUserCreate.message(data) });
    const teamMember = await workspaceTeamUsersService.update(Id, teamId, data);
    return res.status(200).json({ teamMember });
}))

// 팀 맴버 삭제
teamIdMemberIdRouter.delete('/', authenticateToken, checkTeamAdminOrManager, catchAsyncErrors(async (req, res) => {
    const Id = Number(req.params.memberId);
    const teamMember = await workspaceTeamUsersService.delete(Id);
    return res.status(200).json({ teamMember });
}))


export default teamIdMemberIdRouter;