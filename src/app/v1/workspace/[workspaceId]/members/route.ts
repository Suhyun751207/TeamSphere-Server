import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import workspaceMemberService from "@services/workspacesMembers";
import userService from "@services/Users";
import profilesService from "@services/Profiles";
import { authenticateToken } from "@middleware/auth";
import { checkWorkspaceAccess, checkWorkspaceAdminOrManager } from "@middleware/workspaceAuth";
import { workspaceMember } from "@interfaces/workspacesMembers";
import { isWorkspaceMemberCreate, isWorkspaceMemberUpdate } from "@interfaces/guard/workspacesMembers.guard";

const workspaceIdMemberRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/workspace/{workspaceId}/members:
 *   get:
 *     summary: 워크스페이스 멤버 목록 조회
 *     tags: [Members]
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
 *         description: 멤버 목록 조회 성공
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
 *                   role:
 *                     type: string
 *                     enum: ['Admin', 'Manager', 'Member', 'Viewer']
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   profile:
 *                     $ref: '#/components/schemas/Profile'
 *       403:
 *         description: 워크스페이스 접근 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
workspaceIdMemberRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const workspaceMemberResult = await workspaceMemberService.read(workspaceId) as unknown as workspaceMember[];
    const membersWithDetails = await Promise.all(
        workspaceMemberResult.map(async (member) => {
            const user = await userService.read(member.userId);
            const profile = await profilesService.read(member.userId);
            return {
                ...member,
                user: user,
                profile: profile || null
            };
        })
    );

    return res.status(200).json(membersWithDetails);
}));

workspaceIdMemberRouter.get("/me", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const member = await workspaceMemberService.readByWorkspacesIdUserId(workspaceId, Number(req.user?.userId));
    return res.status(200).json(member);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/members:
 *   post:
 *     summary: 워크스페이스에 새 멤버 추가
 *     tags: [Members]
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
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *               role:
 *                 type: string
 *                 enum: ['Admin', 'Manager', 'Member', 'Viewer']
 *                 example: 'Member'
 *     responses:
 *       201:
 *         description: 멤버 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: 잘못된 요청 또는 이미 존재하는 사용자
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
workspaceIdMemberRouter.post("/", authenticateToken, checkWorkspaceAdminOrManager, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const workspaceId = Number(req.params.workspaceId);
    const data = { ...body, workspaceId };
    if (!isWorkspaceMemberCreate(data)) return res.status(400).json({ message: isWorkspaceMemberCreate.message(data) });
    const userId = req.body.userId;
    const role = data.role;
    if (!role) return res.status(400).json({ message: "role is required" });
    const existingMembers = await workspaceMemberService.read(workspaceId) as unknown as workspaceMember[];
    const isUserAlreadyMember = existingMembers.some((member: workspaceMember) => member.userId === userId);
    if (isUserAlreadyMember) {
        return res.status(400).json({ message: "이미 존재하는 유저입니다." });
    }
    const workspaceMemberResult = await workspaceMemberService.create({ workspaceId, userId: userId!, role });
    return res.status(201).json(workspaceMemberResult);
}));

workspaceIdMemberRouter.patch("/", authenticateToken, checkWorkspaceAdminOrManager, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const workspaceId = Number(req.params.workspaceId);
    const data = { workspaceId, userId: body.userId, role: body.role };
    if (!isWorkspaceMemberUpdate(data)) return res.status(400).json({ message: isWorkspaceMemberUpdate.message(data) });
    const workspaceMemberResult = await workspaceMemberService.updateWorkspaceIdUserId(workspaceId, body.userId, data);
    return res.status(200).json(workspaceMemberResult);
}));


export default workspaceIdMemberRouter;
