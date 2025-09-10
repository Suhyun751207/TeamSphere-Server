import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import userService from "@services/Users";
import { isUserUpdate } from "@interfaces/guard/Users.guard";
import authService from "@services/Auth";
import ProfileRouter from "./profile/route.ts";
import roomsRouter from "./rooms/route.ts";
import attendanceRouter from "./attendance/route.ts";

const userRouter = Router({ mergeParams: true });

userRouter.use('/profile', ProfileRouter);
userRouter.use('/rooms', roomsRouter);
userRouter.use('/attendance', attendanceRouter);

userRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const user = await userService.read(userId!);
    return res.status(200).json(user);
}));

// 로그인 상태에서 비밀번호 변경
userRouter.patch('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const email = req.user?.email;
    if (!email) return res.status(400).json({ message: "다시 로그인해주세요." });
    const data = { email, password: req.body.password };
    if (!isUserUpdate(data)) return res.status(400).json({ message: isUserUpdate.message(data) });
    if (!req.body.newPassword) return res.status(400).json({ message: "새로운 비밀번호가 필요합니다." });
    const newPassword = req.body.newPassword;
    const user = await authService.updatePassword(Number(userId), data, newPassword);
    return res.status(200).json(user);
}));

// 비로그인 상태에서 이메일로 비밀번호 변경
userRouter.patch('/notlogin', catchAsyncErrors(async (req, res) => {
    const { email, password, newPassword } = req.body;

    if (!email) return res.status(400).json({ message: "이메일이 필요합니다." });
    if (!password) return res.status(400).json({ message: "현재 비밀번호가 필요합니다." });
    if (!newPassword) return res.status(400).json({ message: "새로운 비밀번호가 필요합니다." });

    const data = { email, password };
    if (!isUserUpdate(data)) return res.status(400).json({ message: isUserUpdate.message(data) });

    const users = await userService.read();
    const user = users.find(u => u.email === email);

    if (!user) return res.status(400).json({ message: "존재하지 않는 이메일입니다." });

    const result = await authService.updatePassword(user.id, data, newPassword);
    return res.status(200).json(result);
}));

export default userRouter;
