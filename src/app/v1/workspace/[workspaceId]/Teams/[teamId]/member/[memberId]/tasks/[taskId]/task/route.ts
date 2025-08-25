import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import mongoTaskService from "@services/MongoTaskService.ts";
import { isMongoTaskCreate } from "@interfaces/guard/MongoTask.guard.ts";
import taskIdRouter from "./[taskId]/route.ts";

const taskRouter = Router({ mergeParams: true });
taskRouter.use('/:taskId', taskIdRouter);

taskRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { id } = req.body;
    const tasks = await mongoTaskService.read(Number(id));
    return res.status(200).json(tasks);
}));

taskRouter.post('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const { title, content, tags, attachments_path } = req.body;

    const data = { task_id: Number(taskId), title, content, tags, attachments_path };
    if (!isMongoTaskCreate(data)) return res.status(400).json({ message: isMongoTaskCreate.message(data) });
    const tasks = await mongoTaskService.create(data);
    return res.status(200).json(tasks);
}));

export default taskRouter;
