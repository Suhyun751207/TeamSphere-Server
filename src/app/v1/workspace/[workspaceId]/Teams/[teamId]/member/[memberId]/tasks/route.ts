import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth.ts";
import tasksService from "@services/Tasks.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { isTasksCreate } from "@interfaces/guard/Tasks.guard.ts";

import { TaskPriority } from "@services/ENUM/task_priority_enum.ts";
import { TaskState } from "@services/ENUM/task_states_enum.ts";

import tasksIdRouter from "./[taskId]/route.ts";

const tasksRouter = Router({ mergeParams: true });
tasksRouter.use('/:tasksId', tasksIdRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks:
 *   get:
 *     summary: 팀 멤버의 작업 목록 조회
 *     tags: [Tasks]
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
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 멤버 ID
 *     responses:
 *       200:
 *         description: 작업 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       403:
 *         description: 팀 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const memberId = Number(req.params.memberId);
    const results = await workspaceTeamUsersService.readMemberIdAndTeamId(memberId, teamId);
    const workspaceId = results[0].id;

    const result = await tasksService.read(workspaceId);
    return res.status(200).json(result);
}))

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks:
 *   post:
 *     summary: 새 작업 생성
 *     tags: [Tasks]
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
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 멤버 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - state
 *               - priority
 *             properties:
 *               state:
 *                 type: string
 *                 enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']
 *                 example: 'TODO'
 *               priority:
 *                 type: string
 *                 enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
 *                 example: 'MEDIUM'
 *               task:
 *                 type: string
 *                 example: '새로운 기능 개발'
 *     responses:
 *       200:
 *         description: 작업 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 팀 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.post('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const memberId = Number(req.params.memberId);
    const teamId = Number(req.params.teamId);
    const teamInfo = await workspaceTeamUsersService.readMemberIdAndTeamId(memberId, teamId);
    if (!teamInfo || teamInfo.length === 0) {
        return res.status(400).json({ message: "team task 추가 실패" });
    }
    const state: TaskState = req.body.state;
    const priority: TaskPriority = req.body.priority;
    const task = req.body.task || null;
    const data = { teamMemberId: memberId, state, priority, task };
    if (!isTasksCreate(data)) return res.status(400).json({ message: isTasksCreate.message(data) });
    const result = await tasksService.create(data);
    return res.status(200).json(result);
}));

export default tasksRouter;