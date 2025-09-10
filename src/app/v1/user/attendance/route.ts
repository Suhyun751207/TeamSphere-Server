import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import attendanceRecordsService from "@services/AttendanceRecords.ts";
import { isAttendanceRecordsCreate } from "@interfaces/guard/AttendanceRecords.guard.ts";

const attendanceRouter = Router({ mergeParams: true });

attendanceRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const user = await attendanceRecordsService.readUserId(userId!);
    return res.status(200).json(user);
}));

attendanceRouter.post('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    const data = { userId };
    if (!isAttendanceRecordsCreate(data)) return res.status(400).json({ message: isAttendanceRecordsCreate.message(data) });
    const user = await attendanceRecordsService.create(data);
    return res.status(200).json({ message: "출석 기록이 생성되었습니다.", user });
}));

attendanceRouter.get('/:userid', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.params.userid;
    const user = await attendanceRecordsService.readUserId(Number(userId));
    return res.status(200).json(user);
}));

export default attendanceRouter;
