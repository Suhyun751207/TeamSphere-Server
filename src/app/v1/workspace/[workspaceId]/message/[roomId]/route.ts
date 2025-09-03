import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import roomsUserIdRouter from "./[userId]/route.ts";
import messageRouter from "./message/route.ts";
import messageService from "@services/message.ts";
import roomUserService from "@services/RoomsUser.ts";
import { isRoomsUpdate } from "@interfaces/guard/Rooms.guard.ts";
import roomsService from "@services/Rooms.ts";
import workspacesMembersService from "@services/workspacesMembers";

const roomIdRouter = Router({ mergeParams: true });
roomIdRouter.use('/:userId', roomsUserIdRouter);
roomIdRouter.use('/message', messageRouter);

// GET /v1/workspace/:workspaceId/message/:roomId - 워크스페이스 룸 상세 정보 조회
roomIdRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;
    
    // 워크스페이스 멤버인지 확인
    const isMember = await workspacesMembersService.readByUserIdAndWorkspaceId(Number(userId), Number(workspaceId));
    if (!isMember) {
        return res.status(403).json({ message: "워크스페이스 멤버가 아닙니다." });
    }
    
    const members = await roomUserService.readId(Number(roomId));
    const messages = await messageService.readRoomIdMessage(Number(roomId));
    return res.status(200).json({ members, messages });
}));

// GET /v1/workspace/:workspaceId/message/:roomId/members - 워크스페이스 룸 멤버 조회
roomIdRouter.get('/members', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;
    
    // 워크스페이스 멤버인지 확인
    const isMember = await workspacesMembersService.readByUserIdAndWorkspaceId(Number(userId), Number(workspaceId));
    if (!isMember) {
        return res.status(403).json({ message: "워크스페이스 멤버가 아닙니다." });
    }
    
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

// PATCH /v1/workspace/:workspaceId/message/:roomId/:messageId - 워크스페이스 룸 마지막 메시지 업데이트
roomIdRouter.patch('/:messageId', authenticateToken, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;
    
    // 워크스페이스 멤버인지 확인
    const isMember = await workspacesMembersService.readByUserIdAndWorkspaceId(Number(userId), Number(workspaceId));
    if (!isMember) {
        return res.status(403).json({ message: "워크스페이스 멤버가 아닙니다." });
    }
    
    const room = await roomsService.readIdPatch(Number(roomId));
    const data = { 
        roomId: Number(workspaceId), 
        lastMessageId: Number(req.params.messageId), 
        type: "WORKSPACE", 
        title: room?.title || null 
    };
    
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!isRoomsUpdate(data)) return res.status(400).json({ message: isRoomsUpdate.message(data) });
    
    const rooms = await roomsService.update(Number(roomId), data);
    return res.status(201).json(rooms);
}));

export default roomIdRouter;