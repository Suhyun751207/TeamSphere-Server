import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";
import { isWorkspaceTeamUserCreate } from "@interfaces/guard/WorkspaceTeamUsers.guard";
import { WorkspaceRole } from "@services/ENUM/workspace_roles_enum";
import teamIdMemberIdRouter from "./[memberId]/route";
import workspaceMemberService from "@services/workspacesMembers";
import profilesService from "@services/Profiles";

const teamIdMemberRouter = Router({ mergeParams: true });
teamIdMemberRouter.use("/:memberId", teamIdMemberIdRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member:
 *   get:
 *     summary: 팀 멤버 목록 조회
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 워크스페이스 ID
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 팀 ID
 *     responses:
 *       200:
 *         description: 팀 멤버 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   teamId:
 *                     type: integer
 *                   memberId:
 *                     type: integer
 *                   role:
 *                     type: string
 *                     enum: ['Admin', 'Manager', 'Member', 'Viewer']
 *                   workspaceMember:
 *                     type: object
 *                   profile:
 *                     $ref: '#/components/schemas/Profile'
 *       403:
 *         description: 팀 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member:
 *   post:
 *     summary: 팀에 새 멤버 추가
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 워크스페이스 ID
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 팀 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - role
 *             properties:
 *               memberId:
 *                 type: integer
 *                 example: 123
 *               role:
 *                 type: string
 *                 enum: ['Admin', 'Manager', 'Member', 'Viewer']
 *                 example: 'Member'
 *     responses:
 *       200:
 *         description: 팀 멤버 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamMember:
 *                   type: object
 *       400:
 *         description: 잘못된 요청 또는 이미 팀에 추가된 멤버
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 팀 관리자 또는 매니저 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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