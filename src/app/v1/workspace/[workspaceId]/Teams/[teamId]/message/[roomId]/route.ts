import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import roomsUserIdRouter from "./[userId]/route";
import messageRouter from "./message/route";
import messageService from "@services/message";
import roomUserService from "@services/RoomsUser";
import { isRoomsUpdate } from "@interfaces/guard/Rooms.guard";
import roomsService from "@services/Rooms";
import { checkTeamMember } from "@middleware/workspaceAuth";

const roomIdRouter = Router({ mergeParams: true });
roomIdRouter.use('/:userId', roomsUserIdRouter);
roomIdRouter.use('/message', messageRouter);

// GET /v1/workspace/:workspaceId/Teams/:teamId/message/:roomId - 팀 룸 상세 정보 조회
roomIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const members = await roomUserService.readId(Number(roomId));
    const messages = await messageService.readRoomIdMessage(Number(roomId));
    return res.status(200).json({ members, messages });
}));

roomIdRouter.get('/info', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const room = await roomsService.readId(Number(roomId));
    return res.status(200).json({ room });
}));

// GET /v1/workspace/:workspaceId/Teams/:teamId/message/:roomId/members - 팀 룸 멤버 조회
roomIdRouter.get('/members', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const teamId = req.params.teamId;
    const userId = req.user?.userId;

    const members = await roomUserService.readId(Number(roomId));

    if (!members) {
        return res.status(404).json({ message: "Room not found or no members" });
    }

    // Get online users from socket tracking
    const { getOnlineUsers } = await import('@config/socket');
    const onlineUserIds = getOnlineUsers(Number(roomId));

    // Add online status to members
    const membersWithStatus = members.map((member: any) => ({
        ...member,
        isOnline: onlineUserIds.includes(member.userId)
    }));

    return res.status(200).json({ data: membersWithStatus });
}));

// PATCH /v1/workspace/:workspaceId/Teams/:teamId/message/:roomId/:messageId - 팀 룸 마지막 메시지 업데이트
roomIdRouter.patch('/:messageId', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const workspaceId = req.params.workspaceId;
    const teamId = req.params.teamId;
    const room = await roomsService.readIdPatch(Number(roomId));
    const data = {
        roomId: Number(teamId),
        workspaceId: Number(workspaceId),
        teamId: Number(teamId),
        lastMessageId: Number(req.params.messageId),
        type: "TEAM",
        title: room[0].title || null
    };

    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!isRoomsUpdate(data)) return res.status(400).json({ message: isRoomsUpdate.message(data) });

    const rooms = await roomsService.update(Number(roomId), data);
    return res.status(201).json(rooms);
}));

export default roomIdRouter;
