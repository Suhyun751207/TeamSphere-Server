import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import roomsService from "@services/Rooms.ts";
import { isRoomsCreate } from "@interfaces/guard/Rooms.guard";
import roomsUserIdRouter from "./[userId]/route.ts";
import messageRouter from "./message/route.ts";

const roomIdRouter = Router({ mergeParams: true });
roomIdRouter.use('/:userId', roomsUserIdRouter);
roomIdRouter.use('/message', messageRouter);

export default roomIdRouter;