import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken, optionalAuth } from "@middleware/auth.ts";
import userService from "@services/Users";
import profilesService from "@services/Profiles";
import { isProfilesCreate } from "@interfaces/guard/Profiles.guard";
import ProfileIdRouter from "./[profileId]/route.ts";
import { genders_enum } from "@services/ENUM/genders_enum";
import { upload } from "@middleware/upload.ts";
import { UploadService } from "@services/uploadService.ts";

const ProfileRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/user/profile:
 *   get:
 *     summary: 모든 사용자 프로필 조회
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 프로필 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 profile:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Profile'
 */
ProfileRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const user = await userService.read();
    const profile = await profilesService.read();
    const data = { user, profile }
    return res.status(200).json(data);
}));

/**
 * @swagger
 * /v1/user/profile/me:
 *   get:
 *     summary: 현재 사용자 프로필 조회
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 사용자 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
ProfileRouter.get('/me', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const user = await userService.readById(Number(userId));
    const profile = await profilesService.readById(Number(userId));
    const data = { user, profile }
    return res.status(200).json(data);
}));

ProfileRouter.use('/:profileId', ProfileIdRouter);

/**
 * @swagger
 * /v1/user/profile:
 *   post:
 *     summary: 새 프로필 생성
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - gender
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "홍길동"
 *               age:
 *                 type: integer
 *                 example: 25
 *               gender:
 *                 type: string
 *                 enum: ["Male", "Female", "Other"]
 *                 example: "Male"
 *               phone:
 *                 type: string
 *                 example: "010-1234-5678"
 *               imagePath:
 *                 type: string
 *                 example: "/images/profile.jpg"
 *     responses:
 *       200:
 *         description: 프로필 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
ProfileRouter.post('/', authenticateToken, upload.single("image"), catchAsyncErrors(async (req, res) => {
    const { name, age, gender, phone, imagePath } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!Object.values(genders_enum).includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
    }
    let url = null;
    if (req.file) {
        url = await UploadService.uploadFile(req.file);
    }
    const body = { name, age, gender, phone, imagePath: url, subscriptionState: "Free", userId };
    if (!isProfilesCreate(body)) return res.status(400).json({ message: isProfilesCreate.message(body) });
    const data = await profilesService.create(body);
    return res.status(200).json(data);
}));

export default ProfileRouter;