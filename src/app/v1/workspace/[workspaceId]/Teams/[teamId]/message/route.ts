import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { isRoomsCreate } from "@interfaces/guard/Rooms.guard";
import roomIdRouter from "./[roomId]/route";
import { isRoomUserCreate } from "@interfaces/guard/RoomUser.guard";
import roomUserService from "@services/RoomsUser";
import roomsService from "@services/Rooms";
import { checkTeamMember } from "@middleware/workspaceAuth";

const TeamMessageRouter = Router({ mergeParams: true });
TeamMessageRouter.use('/:roomId', roomIdRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/Teams/{teamId}/message:
 *   get:
 *     summary: 팀 내 모든 룸 조회
 *     tags: [Team Messages]
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
 *     responses:
 *       200:
 *         description: 팀 룸 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   room:
 *                     $ref: '#/components/schemas/Room'
 *       403:
 *         description: 팀 멤버가 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
TeamMessageRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const teamId = req.params.teamId;

    // 팀 타입의 룸들 조회
    const userRooms = await roomUserService.readByUserId(Number(userId));
    const teamRooms = await Promise.all(
        (userRooms || []).map(async (userRoom) => {
            const room = await roomsService.readIdPatch(userRoom.roomId);
            if (room[0].type === "TEAM" && 
                room[0].workspaceId === Number(workspaceId) && 
                room[0].teamId === Number(teamId)) {
                return {
                    ...userRoom,
                    room
                };
            }
            return null;
        })
    );

    const filteredRooms = teamRooms.filter(room => room !== null);
    return res.status(200).json(filteredRooms);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/Teams/{teamId}/message:
 *   post:
 *     summary: 팀 룸 생성
 *     tags: [Team Messages]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "팀 회의방"
 *     responses:
 *       201:
 *         description: 팀 룸 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: object
 *                 roomUser:
 *                   type: object
 *       403:
 *         description: 팀 멤버가 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
TeamMessageRouter.post('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const teamId = req.params.teamId;
    const { title } = req.body;

    const data = {
        type: "TEAM",
        roomId: Number(teamId),
        workspaceId: Number(workspaceId),
        teamId: Number(teamId),
        title: title || `팀 ${teamId} 룸`,
        lastMessageId: null
    };

    if (!isRoomsCreate(data)) {
        return res.status(400).json({ message: isRoomsCreate.message(data) });
    }

    const rooms = await roomsService.create(data);

    const data2 = { roomId: Number(rooms.insertId), userId: Number(userId) };
    if (!isRoomUserCreate(data2)) {
        return res.status(400).json({ message: isRoomUserCreate.message(data2) });
    }

    const roomUser = await roomUserService.create(data2);
    return res.status(201).json({ rooms, roomUser });
}));

export default TeamMessageRouter;
