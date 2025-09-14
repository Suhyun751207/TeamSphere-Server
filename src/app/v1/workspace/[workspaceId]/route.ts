import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { isWorkspaceCreate } from "@interfaces/guard/workspaces.guard";
import workspaceService from "@services/workspaces";
import { authenticateToken } from "@middleware/auth";
import { checkWorkspaceAccess, checkWorkspaceAdminOrManager } from "@middleware/workspaceAuth";
import workspaceMemberService from "@services/workspacesMembers";
import workspaceIdMemberRouter from "./members/route";
import activityLogsRouter from "./activityLogs/route";
import teamRouter from "./Teams/route";
import messageRouter from "./message/route";
import DashboardWorkspaceIdRouter from "./dashboard/route";

const workspaceIdRouter = Router({ mergeParams: true });
workspaceIdRouter.use("/members", workspaceIdMemberRouter);
workspaceIdRouter.use("/activityLog", activityLogsRouter);
workspaceIdRouter.use("/teams", teamRouter);
workspaceIdRouter.use("/message", messageRouter);
workspaceIdRouter.use("/dashboard", DashboardWorkspaceIdRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}:
 *   get:
 *     summary: 워크스페이스 상세 정보 조회
 *     tags: [Workspace]
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
 *         description: 워크스페이스 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workspace:
 *                   $ref: '#/components/schemas/Workspace'
 *                 workspaceMember:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: 워크스페이스 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
workspaceIdRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const workspace = await workspaceService.read(Number(workspaceId));
    const workspaceMember = await workspaceMemberService.read(Number(workspaceId));
    return res.status(200).json({workspace, workspaceMember});
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}:
 *   patch:
 *     summary: 워크스페이스 정보 수정
 *     tags: [Workspace]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Workspace"
 *               description:
 *                 type: string
 *                 example: "수정된 워크스페이스 설명"
 *     responses:
 *       200:
 *         description: 워크스페이스 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
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
workspaceIdRouter.patch("/", authenticateToken, checkWorkspaceAdminOrManager, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const adminId = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const data = { ...body, adminId: adminId! };
    if (!isWorkspaceCreate(data)) return res.status(400).json({ message: isWorkspaceCreate.message(data) });
    const workspace = await workspaceService.update(Number(workspaceId), data);
    return res.status(200).json(workspace);
}));

export default workspaceIdRouter;
