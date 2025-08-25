import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import mongoTaskService from "@services/MongoTaskService.ts";
import { isMongoTaskUpdate } from "@interfaces/guard/MongoTask.guard.ts";
import commentsRouter from "./comments/route.ts";

const taskIdRouter = Router({ mergeParams: true });
taskIdRouter.use('/comments', commentsRouter);

taskIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const result = await mongoTaskService.read(Number(taskId));
    if (!result) return res.status(400).json({ message: "없는 Task Id이다." });
    return res.status(200).json(result);
}));

taskIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const { title, content, tags, attachments_path } = req.body;

    const data = { title, content, tags, attachments_path };
    if (!isMongoTaskUpdate(data)) return res.status(400).json({ message: isMongoTaskUpdate.message(data) });
    const tasks = await mongoTaskService.update(Number(taskId), data);
    if (!tasks) return res.status(400).json({ message: "없는 Task Id이다." });
    return res.status(200).json(tasks);
}));

export default taskIdRouter;