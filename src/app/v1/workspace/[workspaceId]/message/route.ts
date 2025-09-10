import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { isRoomsCreate } from "@interfaces/guard/Rooms.guard";
import roomIdRouter from "./[roomId]/route.ts";
import { isRoomUserCreate } from "@interfaces/guard/RoomUser.guard";
import roomUserService from "@services/RoomsUser";
import roomsService from "@services/Rooms";
import workspacesMembersService from "@services/workspacesMembers";
import { checkWorkspaceAccess } from "@middleware/workspaceAuth.ts";

const WorkspaceMessageRouter = Router({ mergeParams: true });
WorkspaceMessageRouter.use('/:roomId', roomIdRouter);

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message:
 *   get:
 *     summary: 워크스페이스 내 모든 룸 조회
 *     tags: [Messages]
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
 *         description: 룸 목록 조회 성공
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
 *         description: 워크스페이스 멤버가 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
WorkspaceMessageRouter.get('/', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const workspaceId = req.params.workspaceId;

    // 워크스페이스 타입의 룸들 조회
    const userRooms = await roomUserService.readByUserId(Number(userId));
    const workspaceRooms = await Promise.all(
        (userRooms || []).map(async (userRoom) => {
            const room = await roomsService.readIdPatch(userRoom.roomId);
            if (room[0].type === "WORKSPACE" && room[0].id === userRoom.roomId && room[0].workspaceId === Number(workspaceId)) {
                return {
                    ...userRoom,
                    room
                };
            }
            return null;
        })
    );

    const filteredRooms = workspaceRooms.filter(room => room !== null);
    return res.status(200).json(filteredRooms);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message:
 *   post:
 *     summary: 워크스페이스 룸 생성
 *     tags: [Messages]
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
 *               title:
 *                 type: string
 *                 example: "프로젝트 논의방"
 *     responses:
 *       201:
 *         description: 룸 생성 성공
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
 *         description: 워크스페이스 멤버가 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
WorkspaceMessageRouter.post('/', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const workspaceId = req.params.workspaceId;
    const { title } = req.body;

    const data = {
        type: "WORKSPACE",
        roomId: Number(workspaceId),
        workspaceId: Number(workspaceId),
        title: title || `워크스페이스 ${workspaceId} 룸`,
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

export default WorkspaceMessageRouter;
