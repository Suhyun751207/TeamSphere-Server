import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import mongoTaskService from "@services/MongoTaskService.ts";
import { isMongoTaskUpdate } from "@interfaces/guard/MongoTask.guard.ts";
import commentsRouter from "./comments/route.ts";

const taskIdRouter = Router({ mergeParams: true });
taskIdRouter.use('/comments', commentsRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks/{tasksId}/task/{taskId}:
 *   get:
 *     summary: MongoDB 작업 상세 조회
 *     tags: [MongoDB Tasks]
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
 *         description: MySQL 작업 ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: MongoDB 작업 ID
 *     responses:
 *       200:
 *         description: MongoDB 작업 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MongoTask'
 *       400:
 *         description: 존재하지 않는 작업 ID
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
taskIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const result = await mongoTaskService.read(Number(taskId));
    if (!result) return res.status(400).json({ message: "없는 Task Id이다." });
    return res.status(200).json(result);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks/{tasksId}/task/{taskId}:
 *   patch:
 *     summary: MongoDB 작업 정보 수정
 *     tags: [MongoDB Tasks]
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
 *         description: MySQL 작업 ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: MongoDB 작업 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: '수정된 작업 제목'
 *               content:
 *                 type: string
 *                 example: '수정된 작업 내용'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['urgent', 'frontend']
 *               attachments_path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['/uploads/file1.pdf', '/uploads/file2.png']
 *     responses:
 *       200:
 *         description: MongoDB 작업 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MongoTask'
 *       400:
 *         description: 잘못된 요청 또는 존재하지 않는 작업 ID
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
taskIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const { title, content, tags, attachments_path } = req.body;

    const data = { title, content, tags, attachments_path };
    if (!isMongoTaskUpdate(data)) return res.status(400).json({ message: isMongoTaskUpdate.message(data) });
    const tasks = await mongoTaskService.update(Number(taskId), data);
    if (!tasks) return res.status(400).json({ message: "없는 Task Id이다." });
    return res.status(200).json(tasks);
}));

export default taskIdRouter;