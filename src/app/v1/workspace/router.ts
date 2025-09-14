import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { isWorkspaceCreate } from "@interfaces/guard/workspaces.guard";
import workspaceService from "@services/workspaces";
import { authenticateToken } from "@middleware/auth";
import workspaceMemberService from "@services/workspacesMembers";
import workspaceIdRouter from "./[workspaceId]/route";

const workspaceRouter = Router({ mergeParams: true });
workspaceRouter.use("/:workspaceId", workspaceIdRouter);


/**
 * @swagger
 * /v1/workspace:
 *   get:
 *     summary: 사용자가 참여한 워크스페이스 목록 조회
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 워크스페이스 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
workspaceRouter.get("/", authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId!);
    const workspaces = await Promise.all(
        userWorkspaceMembers.map(async (member) => {
            return workspaceService.read(member.workspaceId);
        })
    );
    return res.status(200).json(workspaces.filter(Boolean));
}));

/**
 * @swagger
 * /v1/workspace:
 *   post:
 *     summary: 새 워크스페이스 생성
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Workspace"
 *               description:
 *                 type: string
 *                 example: "워크스페이스 설명"
 *     responses:
 *       201:
 *         description: 워크스페이스 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workspace:
 *                   type: object
 *                 workspaceMember:
 *                   type: object
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
workspaceRouter.post("/", authenticateToken, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const adminId = req.user?.userId;
    if (!isWorkspaceCreate(body)) return res.status(400).json({ message: isWorkspaceCreate.message(body) });
    const workspaceResult = await workspaceService.create({ ...body, adminId: adminId! });
    const workspaceMemberResult = await workspaceMemberService.create({ workspaceId: workspaceResult.insertId, userId: adminId!, role: "Admin" });
    return res.status(201).json({
        workspace: workspaceResult,
        workspaceMember: workspaceMemberResult
    });
}));

export default workspaceRouter;
