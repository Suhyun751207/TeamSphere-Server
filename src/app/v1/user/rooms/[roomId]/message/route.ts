import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import messageService from "@services/message";
import { isMessageCreate, isMessageUpdate } from "@interfaces/guard/Message.guard";

const messageRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/user/rooms/{roomId}/message/{messageId}:
 *   get:
 *     summary: DM 메시지 상세 조회
 *     tags: [DM Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
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
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
messageRouter.get('/:messageId', authenticateToken, catchAsyncErrors(async (req, res) => {
    const messages = await messageService.readId(Number(req.params.messageId));
    return res.status(200).json(messages);
}));

/**
 * @swagger
 * /v1/user/rooms/{roomId}/message:
 *   post:
 *     summary: DM 메시지 생성
 *     tags: [DM Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
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
 *                 example: '안녕하세요!'
 *               imagePath:
 *                 type: string
 *                 nullable: true
 *                 example: '/uploads/image.jpg'
 *     responses:
 *       201:
 *         description: 메시지 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
messageRouter.post('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const data = { roomId: Number(req.params.roomId), userId: Number(req.user?.userId), type: "TEXT", imagePath: req.body.imagePath || null, content: req.body.content, isEdited: false, isValid: true };
    if (!isMessageCreate(data)) return res.status(400).json({ message: isMessageCreate.message(data) });
    const message = await messageService.create(data);
    // Message 59 sent to room 1 by user 1
    return res.status(201).json(message);
}));

/**
 * @swagger
 * /v1/user/rooms/{roomId}/message/{messageId}:
 *   patch:
 *     summary: DM 메시지 수정
 *     tags: [DM Messages]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
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
 *             properties:
 *               content:
 *                 type: string
 *                 example: '수정된 메시지 내용'
 *               imagePath:
 *                 type: string
 *                 nullable: true
 *                 example: '/uploads/new_image.jpg'
 *     responses:
 *       200:
 *         description: 메시지 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 권한 없음 또는 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 메시지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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