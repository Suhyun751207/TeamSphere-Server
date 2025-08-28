import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { isRoomUserCreate } from "@interfaces/guard/RoomUser.guard";
import roomUserService from "@services/RoomsUser.ts";

const roomsUserIdRouter = Router({ mergeParams: true });

roomsUserIdRouter.post('/invite', authenticateToken, catchAsyncErrors(async (req, res) => {
    const data = { roomId: Number(req.params.roomId), userId: Number(req.params.userId) };
    if (!isRoomUserCreate(data)) return res.status(400).json({ message: isRoomUserCreate.message(data) });
    const rooms = await roomUserService.create(data);
    return res.status(201).json(rooms);
}));

export default roomsUserIdRouter;