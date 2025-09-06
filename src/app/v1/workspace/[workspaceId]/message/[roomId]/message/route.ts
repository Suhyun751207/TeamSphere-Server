import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import messageService from "@services/message.ts";
import { isMessageCreate } from "@interfaces/guard/Message.guard.ts";
import workspacesMembersService from "@services/workspacesMembers";
import roomUserService from "@services/RoomsUser.ts";
import { checkWorkspaceAccess } from "@middleware/workspaceAuth";

const messageRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message/{roomId}/message:
 *   get:
 *     summary: 워크스페이스 룸 메시지 조회
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 워크스페이스 ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 룸 ID
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       403:
 *         description: 워크스페이스 멤버가 아니거나 룸 멤버가 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
messageRouter.get('/', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;

    // 룸 멤버인지 확인 
    const roomMembers = await roomUserService.readId(Number(roomId));
    const isRoomMember = roomMembers?.some((member: any) => member.userId === Number(userId));

    if (!isRoomMember) {
        return res.status(403).json({ message: "룸 멤버가 아닙니다." });
    }

    const messages = await messageService.readRoomIdMessage(Number(roomId));
    return res.status(200).json(messages);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message/{roomId}/message:
 *   post:
 *     summary: 워크스페이스 룸에 메시지 전송
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 워크스페이스 ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 룸 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "안녕하세요!"
 *               messageType:
 *                 type: string
 *                 enum: ["TEXT", "IMAGE", "FILE"]
 *                 default: "TEXT"
 *                 example: "TEXT"
 *     responses:
 *       201:
 *         description: 메시지 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 워크스페이스 멤버가 아니거나 룸 멤버가 아님
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
messageRouter.post('/', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;
    const { content } = req.body;

    // 룸 멤버인지 확인
    const roomMembers = await roomUserService.readId(Number(roomId));
    const isRoomMember = roomMembers?.some((member: any) => member.userId === Number(userId));
    if (!isRoomMember) {
        return res.status(403).json({ message: "룸 멤버가 아닙니다." });
    }

    const data = {
        roomId: Number(roomId),
        userId: Number(userId),
        content,
        type: "TEXT",
        imagePath: null,
        isEdited: false,
        isValid: false
    };

    if (!isMessageCreate(data)) {
        return res.status(400).json({ message: isMessageCreate.message(data) });
    }

    const message = await messageService.create(data);

    // Socket을 통한 실시간 메시지 전송
    const { getSocketIO } = await import('@config/socket.ts');
    const io = getSocketIO();
    io.to(`room_${roomId}`).emit('newMessage', {
        id: message.insertId,
        ...data,
        createdAt: new Date()
    });

    return res.status(201).json(message);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message/{roomId}/message/{messageId}:
 *   patch:
 *     summary: 워크스페이스 룸 메시지 수정
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 워크스페이스 ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 룸 ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 메시지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "수정된 메시지입니다"
 *     responses:
 *       200:
 *         description: 메시지 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: 메시지 수정 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
messageRouter.patch('/:messageId', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const messageId = req.params.messageId;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;
    const { content } = req.body;

    // 메시지 작성자인지 확인
    const message = await messageService.readId(Number(messageId));
    if (!message || message.userId !== Number(userId)) {
        return res.status(403).json({ message: "메시지 수정 권한이 없습니다." });
    }

    const updatedMessage = await messageService.update(Number(messageId), {
        content,
        isEdited: true
    });

    // Socket을 통한 실시간 메시지 업데이트
    const { getSocketIO } = await import('@config/socket.ts');
    const io = getSocketIO();
    io.to(`room_${roomId}`).emit('messageUpdated', {
        messageId: Number(messageId),
        content,
        isEdited: true
    });

    return res.status(200).json(updatedMessage);
}));

/**
 * @swagger
 * /v1/workspace/{workspaceId}/message/{roomId}/message/{messageId}:
 *   delete:
 *     summary: 워크스페이스 룸 메시지 삭제
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 워크스페이스 ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 룸 ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 메시지 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: 메시지 삭제 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
messageRouter.delete('/:messageId', authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const roomId = req.params.roomId;
    const messageId = req.params.messageId;
    const workspaceId = req.params.workspaceId;
    const userId = req.user?.userId;

    // 메시지 작성자인지 확인
    const message = await messageService.readId(Number(messageId));
    if (!message || message.userId !== Number(userId)) {
        return res.status(403).json({ message: "메시지 삭제 권한이 없습니다." });
    }

    const deletedMessage = await messageService.delete(Number(messageId));

    // Socket을 통한 실시간 메시지 삭제
    const { getSocketIO } = await import('@config/socket.ts');
    const io = getSocketIO();
    io.to(`room_${roomId}`).emit('messageDeleted', {
        messageId: Number(messageId)
    });

    return res.status(200).json(deletedMessage);
}));

export default messageRouter;
