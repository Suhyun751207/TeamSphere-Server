import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth.ts";
import workspaceTeamService from "@services/workspaceTeams.ts";
import { isWorkspaceTeamCreate } from "@interfaces/guard/workspaceTeams.guard.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import teamIdMemberRouter from "./member/route.ts";
import teamMessageRouter from "./message/route.ts";

const teamIdRouter = Router({ mergeParams: true });
teamIdRouter.use("/members", teamIdMemberRouter);
teamIdRouter.use("/message", teamMessageRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}:
 *   get:
 *     summary: 특정 팀 상세 정보 조회
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
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 팀 ID
 *     responses:
 *       200:
 *         description: 팀 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *                 teamMember:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: 팀 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
teamIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await workspaceTeamService.readId(teamId);
    const teamMember = await workspaceTeamUsersService.readByTeamId(teamId);
    return res.status(200).json({team, teamMember});
})) 

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}:
 *   patch:
 *     summary: 팀 정보 수정
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "수정된 팀명"
 *     responses:
 *       200:
 *         description: 팀 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: 잘못된 요청
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
teamIdRouter.patch('/', authenticateToken, checkTeamAdminOrManager, catchAsyncErrors(async (req, res) => {
    const name = req.body.name;
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user?.userId;
    const id = Number(req.params.teamId);
    const data = { name, workspaceId, managerId: userId };
    if (!isWorkspaceTeamCreate(data)) return res.status(400).json({ message: isWorkspaceTeamCreate.message(data) });
    const teamResult = await workspaceTeamService.update(id,data);
    return res.status(200).json(teamResult);
}))

export default teamIdRouter;