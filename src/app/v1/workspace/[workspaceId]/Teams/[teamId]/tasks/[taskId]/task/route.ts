import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { checkTeamMember, TeamUserIdSelect } from "@middleware/workspaceAuth";
import mongoTaskService from "@services/MongoTaskService";
import { isMongoTaskCreate } from "@interfaces/guard/MongoTask.guard";
import taskIdRouter from "./[taskId]/route";

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
