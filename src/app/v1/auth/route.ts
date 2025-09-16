import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import authService from "@services/Auth";
import { setTokenCookie, clearTokenCookie } from "@utils/jwt";
import { authenticateToken } from "@middleware/auth";
import { isUserCreate } from "@interfaces/guard/Users.guard";
import profilesService from "@services/Profiles";

const authRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /v1/auth/signup:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청 또는 이미 존재하는 사용자
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post("/signup", catchAsyncErrors(async (req, res) => {
    const body = req.body;
    if (!isUserCreate(body)) return res.status(400).json({ message: isUserCreate.message(body) });
    const result = await authService.signup(body);
    if (!result.success) {
        return res.status(400).json(result);
    }
    return res.status(201).json({
        success: result.success,
        message: result.message,
        user: result.user
    });
}));

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=jwt_token_here; HttpOnly; Path=/
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 로그인이 완료되었습니다.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post("/login", catchAsyncErrors(async (req, res) => {
    const body = req.body;
    if (!isUserCreate(body)) return res.status(400).json({ message: isUserCreate.message(body) });
    const result = await authService.login(body);
    if (!result.success) {
        return res.status(401).json(result);
    }
    if (result.token) {
        setTokenCookie(res, result.token);
    }
    const data = {
        success: result.success,
        message: result.message,
        user: result.user
    }
    console.log(data)
    return res.status(200).json(data);
}));

/**
 * @swagger
 * /v1/auth/logout:
 *   get:
 *     summary: 사용자 로그아웃
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 로그아웃이 완료되었습니다.
 */
authRouter.get("/logout", catchAsyncErrors(async (_req, res) => {
    clearTokenCookie(res);

    return res.status(200).json({
        success: true,
        message: "로그아웃이 완료되었습니다."
    });
}));

export default authRouter;
