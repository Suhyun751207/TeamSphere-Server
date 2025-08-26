import { Router, Request, Response } from 'express';
import { MongoRoomsService } from '@services/MongoRoomsService';
import { MongoMessagesService } from '@services/MongoMessagesService';
import { isCreateMongoRoomsRequest, isUpdateMongoRoomsRequest } from '@interfaces/guard/MongoRooms.guard';
import { isCreateMongoMessagesRequest, isUpdateMongoMessagesRequest } from '@interfaces/guard/MongoMessages.guard';
import { authenticateToken } from '@middleware/auth';
import workspacesService from '@services/workspaces';
import workspacesMembersService from '@services/workspacesMembers';
import { ObjectId } from 'mongodb';

const router = Router({ mergeParams: true });
const roomsService = new MongoRoomsService();
const messagesService = new MongoMessagesService();

// 워크스페이스 채팅방 생성 또는 조회
router.post('/rooms', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = (req as any).user.id;

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    const workspaceIdNum = Number(workspaceId);

    // 워크스페이스 존재 확인
    const workspace = await workspacesService.read(workspaceIdNum);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // 워크스페이스 멤버 권한 확인
    const memberList = await workspacesMembersService.readByWorkspacesIdUserId(workspaceIdNum, userId);
    const member = memberList.length > 0 ? memberList[0] : null;
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 기존 워크스페이스 채팅방 확인
    const existingRoom = await roomsService.getRoomByTypeAndChatId('workspace', workspaceIdNum);

    if (existingRoom) {
      return res.json(existingRoom);
    }

    // 워크스페이스의 모든 멤버 조회
    const members = await workspacesMembersService.read(workspaceIdNum);
    const participants = Array.isArray(members) ? members.map((m: any) => m.userId) : [];

    // 새 워크스페이스 채팅방 생성
    const roomData = {
      type: 'workspace' as const,
      chatId: workspaceIdNum,
      participants,
      name: `${workspace.name} 채팅방`
    };

    if (!isCreateMongoRoomsRequest(roomData)) {
      return res.status(400).json({ error: 'Invalid room data' });
    }

    const room = await roomsService.createRoom(roomData);
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating/getting workspace room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 워크스페이스 채팅방 조회
router.get('/rooms', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = (req as any).user.id;

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    const workspaceIdNum = Number(workspaceId);

    // 워크스페이스 멤버 권한 확인
    const memberList = await workspacesMembersService.readByWorkspacesIdUserId(workspaceIdNum, userId);
    const member = memberList.length > 0 ? memberList[0] : null;
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const room = await roomsService.getRoomByTypeAndChatId('workspace', workspaceIdNum);
    
    if (!room) {
      return res.status(404).json({ error: 'Workspace room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error getting workspace room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 워크스페이스 메시지 전송
router.post('/rooms/:roomId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { workspaceId, roomId } = req.params;
    const userId = (req as any).user.id;
    const { content, messageType, replyToId, attachments } = req.body;

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    const workspaceIdNum = Number(workspaceId);

    // 워크스페이스 멤버 권한 확인
    const memberList = await workspacesMembersService.readByWorkspacesIdUserId(workspaceIdNum, userId);
    const member = memberList.length > 0 ? memberList[0] : null;
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const room = await roomsService.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.type !== 'workspace' || room.chatId !== workspaceIdNum) {
      return res.status(403).json({ error: 'Not a workspace room or wrong workspace' });
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
    console.error('Error sending workspace message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 워크스페이스 메시지 목록 조회
router.get('/rooms/:roomId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { workspaceId, roomId } = req.params;
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    const workspaceIdNum = Number(workspaceId);

    // 워크스페이스 멤버 권한 확인
    const memberList = await workspacesMembersService.readByWorkspacesIdUserId(workspaceIdNum, userId);
    const member = memberList.length > 0 ? memberList[0] : null;
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const room = await roomsService.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.type !== 'workspace' || room.chatId !== workspaceIdNum) {
      return res.status(403).json({ error: 'Not a workspace room or wrong workspace' });
    }

    if (!room.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await messagesService.getMessagesByRoomId(roomId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error getting workspace messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 워크스페이스 메시지 수정
router.put('/messages/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { workspaceId, messageId } = req.params;
    const userId = (req as any).user.id;
    const updateData = req.body;

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    if (!ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const workspaceIdNum = Number(workspaceId);

    // 워크스페이스 멤버 권한 확인
    const memberList = await workspacesMembersService.readByWorkspacesIdUserId(workspaceIdNum, userId);
    const member = memberList.length > 0 ? memberList[0] : null;
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
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
    console.error('Error updating workspace message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 워크스페이스 메시지 삭제
router.delete('/messages/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { workspaceId, messageId } = req.params;
    const userId = (req as any).user.id;

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    if (!ObjectId.isValid(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const workspaceIdNum = Number(workspaceId);

    // 워크스페이스 멤버 권한 확인
    const memberList = await workspacesMembersService.readByWorkspacesIdUserId(workspaceIdNum, userId);
    const member = memberList.length > 0 ? memberList[0] : null;
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
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
    console.error('Error deleting workspace message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
