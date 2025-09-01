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