import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import messageService from "@services/message";
import { isMessageCreate } from "@interfaces/guard/Message.guard";

const messageRouter = Router({ mergeParams: true });

messageRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const messages = await messageService.read(Number(roomId));
    return res.status(200).json(messages);
}));

messageRouter.post('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const data = { roomId: Number(req.params.roomId), userId: Number(req.user?.userId), type: "TEXT", content: req.body.content };
    if (!isMessageCreate(data)) return res.status(400).json({ message: isMessageCreate.message(data) });
    const message = await messageService.create(data);
    return res.status(201).json(message);
}));

export default messageRouter;