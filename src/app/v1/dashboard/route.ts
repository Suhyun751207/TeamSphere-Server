import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
const dashboardRouter = Router();

/**
 * @swagger
 * /v1/dashboard:
 *   get:
 *     summary: 대시보드 데이터 조회
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: 대시보드 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "test"
 */
dashboardRouter.get("/", catchAsyncErrors(async (_req, res) => {
    return res.status(200).json({ message: "test" });
}));

export default dashboardRouter;