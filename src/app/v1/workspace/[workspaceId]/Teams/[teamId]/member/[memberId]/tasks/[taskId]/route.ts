import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth.ts";
import tasksService from "@services/Tasks.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { isTasksCreate } from "@interfaces/guard/Tasks.guard.ts";

import { TaskPriority } from "@services/ENUM/task_priority_enum.ts";
import { TaskState } from "@services/ENUM/task_states_enum.ts";
import taskRouter from "./task/route.ts";

const tasksIdRouter = Router({ mergeParams: true });
tasksIdRouter.use('/task', taskRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks/{tasksId}:
 *   get:
 *     summary: 특정 작업 상세 조회
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
 *       - in: path
 *         name: tasksId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업 ID
 *     responses:
 *       200:
 *         description: 작업 상세 정보 조회 성공
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
tasksIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const memberId = Number(req.params.memberId);
    const results = await workspaceTeamUsersService.readMemberIdAndTeamId(memberId, teamId);
    const workspaceId = results[0].id;

    const result = await tasksService.read(workspaceId);
    return res.status(200).json(result);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks/{tasksId}:
 *   patch:
 *     summary: 작업 정보 수정
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
 *       - in: path
 *         name: tasksId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']
 *                 example: 'IN_PROGRESS'
 *               priority:
 *                 type: string
 *                 enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
 *                 example: 'HIGH'
 *               task:
 *                 type: string
 *                 example: '수정된 작업 내용'
 *     responses:
 *       200:
 *         description: 작업 수정 성공
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
tasksIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { teamId, memberId, tasksId } = req.params;
    const teamInfo = await workspaceTeamUsersService.readMemberIdAndTeamId(Number(memberId), Number(teamId));
    if (!teamInfo || teamInfo.length === 0) {
        return res.status(400).json({ message: "team task 수정 실패" });
    }
    const state: TaskState = req.body.state;
    const priority: TaskPriority = req.body.priority;
    const task: string | null = req.body.task || null;
    const data = { state, priority, task };
    if (!isTasksCreate(data)) return res.status(400).json({ message: isTasksCreate.message(data) });

    const result = await tasksService.update(Number(tasksId), data);
    return res.status(200).json(result);
}));

export default tasksIdRouter;