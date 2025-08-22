import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import mongoTaskService from "@services/MongoTaskService.ts";
import { isMongoTaskUpdate } from "@interfaces/guard/MongoTask.guard.ts";

const mongoTaskIdRouter = Router({ mergeParams: true });

// GET - 특정 MongoDB Task 조회
mongoTaskIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;

    const result = await mongoTaskService.read(taskId);
    if (!result) {
        return res.status(404).json({ message: "MongoDB Task를 찾을 수 없습니다" });
    }

    return res.status(200).json(result);
}));

// PATCH - MongoDB Task 수정
mongoTaskIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const updateData = req.body;

    // dueDate가 문자열로 전달된 경우 Date 객체로 변환
    if (updateData.dueDate && typeof updateData.dueDate === 'string') {
        updateData.dueDate = new Date(updateData.dueDate);
    }

    if (!isMongoTaskUpdate(updateData)) {
        return res.status(400).json({
            message: "유효하지 않은 MongoDB Task 업데이트 데이터",
            errors: isMongoTaskUpdate.message(updateData)
        });
    }

    const result = await mongoTaskService.update(taskId, updateData);
    if (!result) {
        return res.status(404).json({ message: "MongoDB Task를 찾을 수 없습니다" });
    }

    return res.status(200).json(result);
}));

export default mongoTaskIdRouter;
