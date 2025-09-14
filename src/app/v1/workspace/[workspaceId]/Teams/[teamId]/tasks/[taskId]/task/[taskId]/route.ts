import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { checkTeamMember, TeamUserIdSelect } from "@middleware/workspaceAuth";
import mongoTaskService from "@services/MongoTaskService";
import { isMongoTaskUpdate } from "@interfaces/guard/MongoTask.guard";
import commentsRouter from "./comments/route";

const taskIdRouter = Router({ mergeParams: true });
taskIdRouter.use('/comments', commentsRouter);

taskIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const id = req.params.taskId;
    const result = await mongoTaskService.readById(Number(id));
    if (!result) return res.status(400).json({ message: "없는 Id입니다." });
    return res.status(200).json(result);
}));

taskIdRouter.patch('/', authenticateToken, checkTeamMember, TeamUserIdSelect, catchAsyncErrors(async (req, res) => {
    const taskId = req.params.taskId;
    const { title, content, tags, attachments_path } = req.body;
    const userId = req.team?.id;

    const data = { workspace_team_user_id: userId, title, content, tags, attachments_path };
    if (!isMongoTaskUpdate(data)) return res.status(400).json({ message: isMongoTaskUpdate.message(data) });
    const tasks = await mongoTaskService.update(Number(taskId), { ...data });
    if (!tasks) return res.status(400).json({ message: "없는 Id입니다." });
    return res.status(200).json(tasks);
}));

export default taskIdRouter;