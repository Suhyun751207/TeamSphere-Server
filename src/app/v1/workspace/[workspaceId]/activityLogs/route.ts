import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkWorkspaceAccess } from "@middleware/workspaceAuth.ts";
import activityLogsService from "@services/ActivityLogs.ts";
import { isActivityLogsCreate } from "@interfaces/guard/ActivityLogs.guard.ts";
import workspaceMemberService from "@services/workspacesMembers.ts";

const activityLogsRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/workspace/{workspaceId}/activityLog:
 *   get:
 *     summary: 워크스페이스 활동 로그 조회
 *     tags: [Activity Logs]
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
 *         description: 활동 로그 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   workspaceId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   action:
 *                     type: string
 *                   description:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: 워크스페이스 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
activityLogsRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const activityLogs = await activityLogsService.read(Number(workspaceId));
    return res.status(200).json(activityLogs);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/activityLog:
 *   post:
 *     summary: 새 활동 로그 생성
 *     tags: [Activity Logs]
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
 *               - action
 *               - description
 *             properties:
 *               action:
 *                 type: string
 *                 example: "TASK_CREATED"
 *               description:
 *                 type: string
 *                 example: "새 작업이 생성되었습니다"
 *     responses:
 *       201:
 *         description: 활동 로그 생성 성공
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
 *         description: 워크스페이스 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
activityLogsRouter.post("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;
    const workspaceMember = await workspaceMemberService.readByWorkspacesIdUserId(Number(workspaceId), Number(userId));
    const data = { ...body, workspaceId: Number(workspaceId), userId: workspaceMember[0].id };
    if (!isActivityLogsCreate(data)) return res.status(400).json({ message: isActivityLogsCreate.message(data) });
    const activityLogResult = await activityLogsService.create(data);
    return res.status(201).json(activityLogResult);
}));

export default activityLogsRouter;
