import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import roomsUserIdRouter from "./[userId]/route.ts";
import messageRouter from "./message/route.ts";
import messageService from "@services/message.ts";
import roomUserService from "@services/RoomsUser.ts";
import { isRoomsUpdate } from "@interfaces/guard/Rooms.guard.ts";
import roomsService from "@services/Rooms.ts";

const roomIdRouter = Router({ mergeParams: true });
roomIdRouter.use('/:userId', roomsUserIdRouter);
roomIdRouter.use('/message', messageRouter);


roomIdRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const members = await roomUserService.readId(Number(roomId));
    const messages = await messageService.readRoomIdMessage(Number(roomId));
    return res.status(200).json({ members, messages });
}));

// GET /v1/user/rooms/:roomId/members - Fetch room members with online status
roomIdRouter.get('/members', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const members = await roomUserService.readId(Number(roomId));
    
    if (!members) {
        return res.status(404).json({ message: "Room not found or no members" });
    }
    
    // Get online users from socket tracking
    const { getOnlineUsers } = await import('@config/socket.ts');
    const onlineUserIds = getOnlineUsers(Number(roomId));
    
    // Add online status to members
    const membersWithStatus = members.map((member: any) => ({
        ...member,
        isOnline: onlineUserIds.includes(member.userId)
    }));
    
    return res.status(200).json({ data: membersWithStatus });
}));

roomIdRouter.patch('/:messageId', authenticateToken, catchAsyncErrors(async (req, res) => {
    const room = await roomsService.readIdPatch(Number(req.params.roomId));
    const data = { roomId: null, lastMessageId: Number(req.params.messageId), type: "DM", title: null };
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!isRoomsUpdate(data)) return res.status(400).json({ message: isRoomsUpdate.message(data) });
    const rooms = await roomsService.update(Number(req.params.roomId), data);
    return res.status(201).json(rooms);
}));

export default roomIdRouter;