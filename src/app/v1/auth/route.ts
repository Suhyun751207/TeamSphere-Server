import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import authService from "@services/Auth.ts";
import { setTokenCookie, clearTokenCookie } from "@utils/jwt.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { isUserCreate } from "@interfaces/guard/Users.guard.ts";
import profilesService from "@services/Profiles.ts";

const authRouter = Router({ mergeParams: true });

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
    return res.status(200).json({
        success: result.success,
        message: result.message,
        user: result.user
    });
}));

authRouter.get("/logout", catchAsyncErrors(async (_req, res) => {
    clearTokenCookie(res);

    return res.status(200).json({
        success: true,
        message: "로그아웃이 완료되었습니다."
    });
}));

export default authRouter;
