import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember, TeamUserIdSelect } from "@middleware/workspaceAuth.ts";
import mongoTaskService from "@services/MongoTaskService.ts";
import { isMongoTaskCreate } from "@interfaces/guard/MongoTask.guard.ts";
import taskIdRouter from "./[taskId]/route.ts";

const taskRouter = Router({ mergeParams: true });
taskRouter.use('/:taskId', taskIdRouter);

taskRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const tasks = await mongoTaskService.readByTaskId(taskId);
    return res.status(200).json(tasks);
}));

taskRouter.post('/', authenticateToken, checkTeamMember, TeamUserIdSelect, catchAsyncErrors(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const { title, content, tags, attachments_path } = req.body;
    const userId = req.team?.id;

    const data = { workspace_team_user_id: userId, task_id: taskId, title, content, tags, attachments_path };
    if (!isMongoTaskCreate(data)) return res.status(400).json({ message: isMongoTaskCreate.message(data) });
    const tasks = await mongoTaskService.create(data);
    return res.status(200).json(tasks);
}));

export default taskRouter;
