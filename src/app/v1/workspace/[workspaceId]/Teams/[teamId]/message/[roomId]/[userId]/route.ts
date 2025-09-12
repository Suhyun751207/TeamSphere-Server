import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import roomUserService from "@services/RoomsUser.ts";
import { isRoomUserCreate } from "@interfaces/guard/RoomUser.guard.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { checkTeamMember } from "@middleware/workspaceAuth";

const roomsUserIdRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/workspace/{workspaceId}/Teams/{teamId}/message/{roomId}/{userId}:
 *   post:
 *     summary: 팀 룸에 사용자 추가
 *     tags: [Team Room Members]
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
 *         description: 팀 룸에 사용자 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: 잘못된 요청 또는 추가할 사용자가 팀 멤버가 아님
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
roomsUserIdRouter.post('/add', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;
    const workspaceId = req.params.workspaceId;
    const teamId = req.params.teamId;
    const requestUserId = req.user?.userId;
    
    if (requestUserId === Number(userId)) {
        return res.status(400).json({ message: "자신을 추가할 수 없습니다." });
    }

    // Validate parameters
    if (!requestUserId || !userId || !workspaceId || !teamId || !roomId) {
        return res.status(400).json({ message: "필수 매개변수가 누락되었습니다." });
    }

    // 추가할 사용자도 팀 멤버인지 확인
    const isTargetTeamMember = await workspaceTeamUsersService.readByTeamId(Number(teamId));
    if (!isTargetTeamMember || isTargetTeamMember.length === 0) {
        return res.status(400).json({ message: "추가할 사용자가 팀 멤버가 아닙니다." });
    }

    // 사용자가 이미 해당 룸의 멤버인지 확인
    const roomMembers = await roomUserService.readId(Number(roomId));
    const existingMember = roomMembers?.find(member => member.userId === Number(userId));
    if (existingMember) {
        return res.status(400).json({ message: "사용자가 이미 해당 룸의 멤버입니다." });
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
 * /v1/workspace/{workspaceId}/Teams/{teamId}/message/{roomId}/{userId}:
 *   delete:
 *     summary: 팀 룸에서 사용자 제거
 *     tags: [Team Room Members]
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
 *         description: 팀 룸에서 사용자 제거 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: 팀 멤버 권한 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
roomsUserIdRouter.delete('/remove', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;
    const workspaceId = req.params.workspaceId;
    const teamId = req.params.teamId;
    const requestUserId = req.user?.userId;

    const roomUser = await roomUserService.deleteByRoomIdAndUserId(Number(roomId), Number(userId));
    return res.status(200).json(roomUser);
}));

export default roomsUserIdRouter;
