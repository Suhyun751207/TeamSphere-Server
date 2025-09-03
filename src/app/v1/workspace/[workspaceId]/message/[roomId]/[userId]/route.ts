import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import roomUserService from "@services/RoomsUser.ts";
import { isRoomUserCreate } from "@interfaces/guard/RoomUser.guard.ts";
import workspacesMembersService from "@services/workspacesMembers";

const roomsUserIdRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message/{roomId}/{userId}:
 *   post:
 *     summary: 워크스페이스 룸에 사용자 추가
 *     tags: [Room Members]
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
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 룸 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 추가할 사용자 ID
 *     responses:
 *       201:
 *         description: 룸에 사용자 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: 잘못된 요청 또는 추가할 사용자가 워크스페이스 멤버가 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 워크스페이스 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
roomsUserIdRouter.post('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;
    const workspaceId = req.params.workspaceId;
    const requestUserId = req.user?.userId;
    
    // 워크스페이스 멤버인지 확인
    const isMember = await workspacesMembersService.readByUserIdAndWorkspaceId(Number(requestUserId), Number(workspaceId));
    if (!isMember) {
        return res.status(403).json({ message: "워크스페이스 멤버가 아닙니다." });
    }
    
    // 추가할 사용자도 워크스페이스 멤버인지 확인
    const isTargetMember = await workspacesMembersService.readByUserIdAndWorkspaceId(Number(userId), Number(workspaceId));
    if (!isTargetMember) {
        return res.status(400).json({ message: "추가할 사용자가 워크스페이스 멤버가 아닙니다." });
    }
    
    const data = { roomId: Number(roomId), userId: Number(userId) };
    if (!isRoomUserCreate(data)) {
        return res.status(400).json({ message: isRoomUserCreate.message(data) });
    }
    
    const roomUser = await roomUserService.create(data);
    return res.status(201).json(roomUser);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message/{roomId}/{userId}:
 *   delete:
 *     summary: 워크스페이스 룸에서 사용자 제거
 *     tags: [Room Members]
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
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 룸 ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 제거할 사용자 ID
 *     responses:
 *       200:
 *         description: 룸에서 사용자 제거 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: 워크스페이스 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
roomsUserIdRouter.delete('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;
    const workspaceId = req.params.workspaceId;
    const requestUserId = req.user?.userId;
    
    // 워크스페이스 멤버인지 확인
    const isMember = await workspacesMembersService.readByUserIdAndWorkspaceId(Number(requestUserId), Number(workspaceId));
    if (!isMember) {
        return res.status(403).json({ message: "워크스페이스 멤버가 아닙니다." });
    }
    
    const roomUser = await roomUserService.deleteByRoomIdAndUserId(Number(roomId), Number(userId));
    return res.status(200).json(roomUser);
}));

export default roomsUserIdRouter;
