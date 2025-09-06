import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { isRoomUserCreate } from "@interfaces/guard/RoomUser.guard";
import roomUserService from "@services/RoomsUser.ts";

const roomsUserIdRouter = Router({ mergeParams: true });

roomsUserIdRouter.post('/invite', authenticateToken, catchAsyncErrors(async (req, res) => {
    const requestUserId = req.user?.userId;
    if (requestUserId === Number(req.params.userId)) {
        return res.status(400).json({ message: "자신을 추가할 수 없습니다." });
    }
    const data = { roomId: Number(req.params.roomId), userId: Number(req.params.userId) };
    if (!isRoomUserCreate(data)) return res.status(400).json({ message: isRoomUserCreate.message(data) });
    const rooms = await roomUserService.create(data);
    return res.status(201).json(rooms);
}));

export default roomsUserIdRouter;