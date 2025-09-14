import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { checkWorkspaceAccess, checkWorkspaceAdminOrManager } from "@middleware/workspaceAuth";
import workspaceTeamService from "@services/workspaceTeams";
import { isWorkspaceTeamCreate } from "@interfaces/guard/workspaceTeams.guard";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";
import workspaceMemberService from "@services/workspacesMembers";
import teamIdRouter from "./[teamId]/route";

const teamRouter = Router({ mergeParams: true });
teamRouter.use("/:teamId", teamIdRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams:
 *   get:
 *     summary: 워크스페이스 내 모든 팀 조회
 *     tags: [Teams]
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
 *     responses:
 *       200:
 *         description: 팀 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       403:
 *         description: 워크스페이스 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
teamRouter.get('/', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const team = await workspaceTeamService.read(Number(workspaceId));
    return res.status(200).json(team);
}))

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams:
 *   post:
 *     summary: 새 팀 생성
 *     tags: [Teams]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "개발팀"
 *     responses:
 *       201:
 *         description: 팀 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamResult:
 *                   type: object
 *                 teamUsersResult:
 *                   type: object
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 관리자 또는 매니저 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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