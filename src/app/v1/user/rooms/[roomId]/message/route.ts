import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import messageService from "@services/message";
import { isMessageCreate, isMessageUpdate } from "@interfaces/guard/Message.guard";

const messageRouter = Router({ mergeParams: true });

messageRouter.get('/:messageId', authenticateToken, catchAsyncErrors(async (req, res) => {
    const messages = await messageService.readId(Number(req.params.messageId));
    return res.status(200).json(messages);
}));

messageRouter.post('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const data = { roomId: Number(req.params.roomId), userId: Number(req.user?.userId), type: "TEXT", imagePath: req.body.imagePath || null, content: req.body.content, isEdited: false, isValid: true };
    if (!isMessageCreate(data)) return res.status(400).json({ message: isMessageCreate.message(data) });
    const message = await messageService.create(data);
    return res.status(201).json(message);
}));

// 메시지 id를 받아 메시지 데이터를 read하고 read data 속 userId와 authenticateToken에서 오는 userId 일치하면 수정 진행
messageRouter.patch('/:messageId', authenticateToken, catchAsyncErrors(async (req, res) => {
    const messageId = req.params.messageId;
    const message = await messageService.read(Number(messageId));
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.userId !== Number(req.user?.userId)) return res.status(401).json({ message: "Unauthorized" });
    const data = { roomId: Number(req.params.roomId), userId: Number(req.user?.userId), type: "TEXT", imagePath: req.body.imagePath || null, content: req.body.content || null, isEdited: true, isValid: true };
    if (!isMessageUpdate(data)) return res.status(400).json({ message: isMessageUpdate.message(data) });
    const updatedMessage = await messageService.update(Number(messageId), data);
    return res.status(200).json(updatedMessage);
}));



export default messageRouter;