import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import roomsService from "@services/Rooms.ts";
import { isRoomsCreate } from "@interfaces/guard/Rooms.guard";
import roomsUserIdRouter from "./[userId]/route.ts";
import messageRouter from "./message/route.ts";
import messageService from "@services/message.ts";

const roomIdRouter = Router({ mergeParams: true });
roomIdRouter.use('/:userId', roomsUserIdRouter);
roomIdRouter.use('/message', messageRouter);


roomIdRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const messages = await messageService.read(Number(roomId));
    return res.status(200).json(messages);
}));

export default roomIdRouter;