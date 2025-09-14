import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import userService from "@services/Users";
import profilesService from "@services/Profiles";
import { isProfilesCreate } from "@interfaces/guard/Profiles.guard";
import { genders_enum } from "@services/ENUM/genders_enum";
import { upload } from "@middleware/upload";
import { UploadService } from "@services/uploadService";

const ProfileIdRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/user/profile/{profileId}:
 *   get:
 *     summary: 특정 사용자 프로필 상세 조회
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
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
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
ProfileIdRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = Number(req.params?.profileId);
    const user = await userService.readById(userId);
    const profile = await profilesService.readById(userId);
    const data = { user, profile }
    return res.status(200).json(data);
}));

ProfileIdRouter.post('/', authenticateToken, upload.single("image"), catchAsyncErrors(async (req, res) => {
    const userId = Number(req.params?.profileId);
    const { name, age, gender, phone } = req.body;
    if (!Object.values(genders_enum).includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
    }
    let url = null;
    if (req.file) {
        url = await UploadService.uploadFile(req.file);
    }

    const body = { name, age: Number(age), gender, phone, imagePath: url, subscriptionState: "Free", userId };
    if (!isProfilesCreate(body)) return res.status(400).json({ message: isProfilesCreate.message(body) });
    const data = await profilesService.create(body);
    return res.status(200).json(data);
}));

/**
 * @swagger
 * /v1/user/profile/{profileId}:
 *   patch:
 *     summary: 사용자 프로필 정보 수정
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: '홍길동'
 *               age:
 *                 type: integer
 *                 example: 25
 *               gender:
 *                 type: string
 *                 enum: ['Male', 'Female', 'Other']
 *                 example: 'Male'
 *               phone:
 *                 type: string
 *                 example: '010-1234-5678'
 *               imagePath:
 *                 type: string
 *                 example: '/uploads/profile/user123.jpg'
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: 잘못된 요청 또는 유효하지 않은 성별 값
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
ProfileIdRouter.patch('/', authenticateToken, upload.single("image"), catchAsyncErrors(async (req, res) => {
    const userId = Number(req.params?.profileId);
    const { name, age, gender, phone } = req.body;
    if (!Object.values(genders_enum).includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
    }
    let url = null;
    if (req.file) {
        url = await UploadService.uploadFile(req.file);
    }

    const body = { name, age: Number(age), gender, phone, imagePath: url, subscriptionState: "Free", userId };
    if (!isProfilesCreate(body)) return res.status(400).json({ message: isProfilesCreate.message(body) });
    const data = await profilesService.update(userId, body);
    return res.status(200).json(data);
}));

export default ProfileIdRouter;