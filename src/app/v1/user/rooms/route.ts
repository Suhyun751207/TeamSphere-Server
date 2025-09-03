import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { isRoomsCreate } from "@interfaces/guard/Rooms.guard";
import roomIdRouter from "./[roomId]/route";
import { isRoomUserCreate } from "@interfaces/guard/RoomUser.guard";
import roomUserService from "@services/RoomsUser";
import roomsService from "@services/Rooms";

const roomsRouter = Router({ mergeParams: true });
roomsRouter.use('/:roomId', roomIdRouter);

/**
 * @swagger
 * /v1/user/rooms:
 *   get:
 *     summary: 사용자 DM 룸 목록 조회
 *     tags: [DM Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 사용자 DM 룸 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   roomId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   room:
 *                     $ref: '#/components/schemas/Room'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
roomsRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const userRooms = await roomUserService.readByUserId(Number(userId));
    
    const roomsWithDetails = await Promise.all(
        (userRooms || []).map(async (userRoom) => {
            return {
                ...userRoom,
                room: await roomsService.readIdPatch(userRoom.roomId)
            };
        })
    );
    
    return res.status(200).json(roomsWithDetails);
}));

/**
 * @swagger
 * /v1/user/rooms:
 *   post:
 *     summary: 새 DM 룸 생성
 *     tags: [DM Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: DM 룸 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: object
 *                   properties:
 *                     insertId:
 *                       type: integer
 *                 rooms2:
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
roomsRouter.post('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const data = { type: "DM" };
    if (!isRoomsCreate(data)) return res.status(400).json({ message: isRoomsCreate.message(data) });
    const rooms = await roomsService.create(data);

    const data2 = { roomId: Number(rooms.insertId), userId: Number(req.user?.userId) };
    if (!isRoomUserCreate(data2)) return res.status(400).json({ message: isRoomUserCreate.message(data2) });
    const rooms2 = await roomUserService.create(data2);
    return res.status(201).json({rooms, rooms2});
}));

export default roomsRouter;