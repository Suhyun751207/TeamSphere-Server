import { Router, Request, Response } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { MongoRoomsService } from "@services/MongoRoomsService";
import { MongoMessagesService } from "@services/MongoMessagesService";
import { MongoReadStatusService } from "@services/MongoReadStatusService";
import { isCreateMongoRoomsRequest } from "@interfaces/guard/MongoRooms.guard";
import { isCreateMongoMessagesRequest } from "@interfaces/guard/MongoMessages.guard";
import { getSocketIO } from "@config/socket";
import { ObjectId } from 'mongodb';

const MessageDmRouter = Router();
const roomsService = new MongoRoomsService();
const messagesService = new MongoMessagesService();
const readStatusService = new MongoReadStatusService();

// GET / - 사용자가 속한 모든 DM 채팅방 목록 조회
MessageDmRouter.get('/', authenticateToken, catchAsyncErrors(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // type이 'dm'이고 participants에 현재 사용자가 포함된 방들 조회
  const dmRooms = await roomsService.getRoomsByUserAndType(Number(userId), 'dm');
  
  res.status(200).json({
    success: true,
    data: dmRooms
  });
}));

// GET /:roomId - 특정 DM 채팅방 상세 정보 및 메시지 목록 조회
MessageDmRouter.get('/:roomId', authenticateToken, catchAsyncErrors(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { roomId } = req.params;
  const { page = '1', limit = '50' } = req.query;
  
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!ObjectId.isValid(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }

  // 채팅방 정보 조회 및 권한 확인
  const room = await roomsService.getRoomById(new ObjectId(roomId));
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.type !== 'dm') {
    return res.status(400).json({ error: 'This is not a DM room' });
  }

  if (!room.participants.includes(Number(userId))) {
    return res.status(403).json({ error: 'Access denied to this room' });
  }

  // 메시지 목록 조회 (페이지네이션)
  const messageResult = await messagesService.getMessagesByRoomId(
    new ObjectId(roomId),
    Number(page),
    Number(limit)
  );

  res.status(200).json({
    success: true,
    data: {
      room,
      messages: messageResult.messages,
      pagination: {
        page: messageResult.page,
        limit: Number(limit),
        total: messageResult.total,
        totalPages: messageResult.totalPages
      }
    }
  });
}));

// POST /room - 새로운 DM 채팅방 생성
MessageDmRouter.post('/room', authenticateToken, catchAsyncErrors(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { targetUserId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!targetUserId || typeof targetUserId !== 'number') {
    return res.status(400).json({ error: 'Target user ID is required' });
  }

  if (Number(userId) === targetUserId) {
    return res.status(400).json({ error: 'Cannot create DM with yourself' });
  }

  // 이미 존재하는 DM 방이 있는지 확인
  const existingRoom = await roomsService.findDMRoom(Number(userId), targetUserId);
  if (existingRoom) {
    return res.status(200).json({
      success: true,
      data: existingRoom,
      message: 'DM room already exists'
    });
  }

  // 새 DM 방 생성
  const roomData = {
    type: 'dm' as const,
    chatId: null, // DM의 경우 null
    participants: [Number(userId), targetUserId],
    name: undefined // DM은 이름이 없음
  };

  if (!isCreateMongoRoomsRequest(roomData)) {
    return res.status(400).json({ error: 'Invalid room data' });
  }

  const newRoom = await roomsService.createRoom(roomData);

  // Socket.IO로 새 방 생성 알림 전송
  try {
    const io = getSocketIO();
    // 두 참여자 모두에게 새 방 생성 알림
    newRoom.participants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('newRoom', {
        room: newRoom,
        type: 'dm'
      });
    });
  } catch (error) {
    console.error('Socket.IO emit error:', error);
  }

  res.status(201).json({
    success: true,
    data: newRoom
  });
}));

// POST /:roomId/message - DM 메시지 전송 (MongoDB)
MessageDmRouter.post('/:roomId/message', authenticateToken, catchAsyncErrors(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { roomId } = req.params;
  const { content, messageType = 'text', replyToId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!ObjectId.isValid(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // 채팅방 권한 확인
  const room = await roomsService.getRoomById(new ObjectId(roomId));
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.type !== 'dm') {
    return res.status(400).json({ error: 'This is not a DM room' });
  }

  if (!room.participants.includes(Number(userId))) {
    return res.status(403).json({ error: 'Access denied to this room' });
  }

  // 메시지 데이터 준비
  const messageData = {
    roomId: new ObjectId(roomId),
    userId: Number(userId),
    content,
    messageType,
    replyToId: replyToId ? new ObjectId(replyToId) : undefined
  };

  if (!isCreateMongoMessagesRequest(messageData)) {
    return res.status(400).json({ error: 'Invalid message data' });
  }

  // MongoDB에 메시지 저장
  const savedMessage = await messagesService.createMessage(messageData);

  // 채팅방의 lastMessage 업데이트
  await roomsService.updateLastMessage(new ObjectId(roomId), {
    messageId: savedMessage._id!,
    content: savedMessage.content,
    createdAt: savedMessage.createdAt,
    userId: savedMessage.userId
  });

  // Socket.IO를 통한 실시간 메시지 전송
  const realtimeMessage = {
    _id: savedMessage._id,
    roomId: savedMessage.roomId,
    userId: savedMessage.userId,
    content: savedMessage.content,
    messageType: savedMessage.messageType,
    replyToId: savedMessage.replyToId,
    createdAt: savedMessage.createdAt,
    isDeleted: savedMessage.isDeleted,
    isEdited: savedMessage.isEdited
  };

  // Socket.IO로 실시간 메시지 전송
  try {
    const io = getSocketIO();
    io.to(roomId).emit('new-message', realtimeMessage);
    
    // 방 참여자들에게 lastMessage 업데이트 알림
    const updatedRoom = await roomsService.getRoomById(new ObjectId(roomId));
    if (updatedRoom && updatedRoom.participants) {
      const lastMessageUpdate = {
        roomId: roomId,
        lastMessage: {
          messageId: savedMessage._id,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt,
          userId: savedMessage.userId
        }
      };
      
      updatedRoom.participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('roomUpdated', lastMessageUpdate);
      });
    }
  } catch (error) {
    console.error('Socket.IO emit error:', error);
  }

  res.status(201).json({
    success: true,
    data: savedMessage
  });
}));

// POST /:roomId/read - 메시지 읽음 처리
MessageDmRouter.post('/:roomId/read', authenticateToken, catchAsyncErrors(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { roomId } = req.params;
  const { messageId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!messageId) {
    return res.status(400).json({ error: 'Message ID is required' });
  }

  // 읽음 상태 업데이트
  await readStatusService.updateReadStatus({
    roomId,
    userId: Number(userId),
    lastReadMessageId: messageId,
    lastReadAt: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Read status updated'
  });
}));

export default MessageDmRouter;
