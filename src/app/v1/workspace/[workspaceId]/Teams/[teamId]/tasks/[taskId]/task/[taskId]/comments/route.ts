import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import mongoCommentsService from "@services/MongoCommentsService.ts";
import { isMongoCommentsCreate } from "@interfaces/guard/MongoComments.guard.ts";
import commentsIdRouter from "./[commentsId]/route.ts";

const commentsRouter = Router({ mergeParams: true });
commentsRouter.use('/:commentsId', commentsIdRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks/{tasksId}/task/{taskId}/comments:
 *   get:
 *     summary: MongoDB 작업 댓글 목록 조회
 *     tags: [MongoDB Comments]
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
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MongoComment'
 *       403:
 *         description: 팀 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
commentsRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const result = await mongoCommentsService.readByTaskId(Number(taskId));
    return res.status(200).json(result);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/teams/{teamId}/member/{memberId}/tasks/{tasksId}/task/{taskId}/comments:
 *   post:
 *     summary: MongoDB 작업에 댓글 추가
 *     tags: [MongoDB Comments]
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
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: '댓글 내용입니다.'
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 123
 *                 description: 대댓글인 경우 부모 댓글 ID
 *     responses:
 *       200:
 *         description: 댓글 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MongoComment'
 *       400:
 *         description: 잘못된 요청 또는 잘못된 parent_id
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
commentsRouter.post('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const user = req.user?.userId;
    const { taskId } = req.params;
    const { content, parent_id } = req.body;
    if (parent_id) {
        const resultParentId = await mongoCommentsService.readId(Number(parent_id));
        if (!resultParentId) return res.status(400).json({ message: "잘못된 parent_id입니다." });
    }
    const data = { task_id: Number(taskId), member_id: user, content, parent_id: parent_id || null };
    if (!isMongoCommentsCreate(data)) return res.status(400).json({ message: isMongoCommentsCreate.message(data) });
    const result = await mongoCommentsService.create(data);
    return res.status(200).json(result);
}));

export default commentsRouter;