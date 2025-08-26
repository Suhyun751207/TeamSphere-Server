import { Router, Request, Response } from 'express';
import { MongoRoomsService } from '@services/MongoRoomsService';
import { MongoMessagesService } from '@services/MongoMessagesService';
import { isCreateMongoRoomsRequest, isUpdateMongoRoomsRequest } from '@interfaces/guard/MongoRooms.guard';
import { isCreateMongoMessagesRequest, isUpdateMongoMessagesRequest } from '@interfaces/guard/MongoMessages.guard';
import { authenticateToken } from '@middleware/auth';
import { ObjectId } from 'mongodb';

const router = Router();
const roomsService = new MongoRoomsService();
const messagesService = new MongoMessagesService();

// DM 채팅방 생성 또는 조회
router.post('/rooms', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { targetUserId } = req.body;
    const userId = (req as any).user.id;

    if (!targetUserId || typeof targetUserId !== 'number') {
      return res.status(400).json({ error: 'targetUserId is required and must be a number' });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot create DM with yourself' });
    }

    // 기존 DM 채팅방 확인
    const participants = [userId, targetUserId].sort();
    const existingRoom = await roomsService.getRoomByTypeAndChatId('dm', Math.min(...participants));

    if (existingRoom) {
      return res.json(existingRoom);
    }

    // 새 DM 채팅방 생성
    const roomData = {
      type: 'dm' as const,
      chatId: Math.min(...participants),
      participants
    };

    if (!isCreateMongoRoomsRequest(roomData)) {
      return res.status(400).json({ error: 'Invalid room data' });
    }

    const room = await roomsService.createRoom(roomData);
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating/getting DM room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자의 DM 채팅방 목록 조회
router.get('/rooms', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await roomsService.getRoomsByUserId(userId, page, limit);
    
    // DM 타입만 필터링
    const dmRooms = result.rooms.filter(room => room.type === 'dm');
    
    res.json({
      ...result,
      rooms: dmRooms,
      total: dmRooms.length
    });
  } catch (error) {
    console.error('Error getting DM rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 특정 DM 채팅방 조회
router.get('/rooms/:roomId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    const room = await roomsService.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.type !== 'dm') {
      return res.status(403).json({ error: 'Not a DM room' });
    }

    if (!room.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error getting DM room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DM 메시지 전송
router.post('/rooms/:roomId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;
    const { content, messageType, replyToId, attachments } = req.body;

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    const room = await roomsService.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.type !== 'dm') {
      return res.status(403).json({ error: 'Not a DM room' });
    }

    if (!room.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messageData = {
      roomId: new ObjectId(roomId),
      userId,
      content,
      messageType,
      replyToId: replyToId ? new ObjectId(replyToId) : undefined,
      attachments
    };

    if (!isCreateMongoMessagesRequest(messageData)) {
      return res.status(400).json({ error: 'Invalid message data' });
    }

    const message = await messagesService.createMessage(messageData);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending DM message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DM 메시지 목록 조회
router.get('/rooms/:roomId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    const room = await roomsService.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.type !== 'dm') {
      return res.status(403).json({ error: 'Not a DM room' });
    }

    if (!room.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await messagesService.getMessagesByRoomId(roomId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error getting DM messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DM 메시지 수정
router.put('/messages/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req as any).user.id;
    const updateData = req.body;

    if (!ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const message = await messagesService.getMessageById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!isUpdateMongoMessagesRequest(updateData)) {
      return res.status(400).json({ error: 'Invalid update data' });
    }

    const updatedMessage = await messagesService.updateMessage(messageId, updateData);
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating DM message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DM 메시지 삭제
router.delete('/messages/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req as any).user.id;

    if (!ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const message = await messagesService.getMessageById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deletedMessage = await messagesService.deleteMessage(messageId);
    res.json(deletedMessage);
  } catch (error) {
    console.error('Error deleting DM message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
