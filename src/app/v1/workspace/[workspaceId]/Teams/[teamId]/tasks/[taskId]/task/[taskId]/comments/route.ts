import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember, TeamUserIdSelect } from "@middleware/workspaceAuth.ts";
import mongoCommentsService from "@services/MongoCommentsService.ts";
import { isMongoCommentsCreate } from "@interfaces/guard/MongoComments.guard.ts";
import commentsIdRouter from "./[commentsId]/route.ts";

const commentsRouter = Router({ mergeParams: true });
commentsRouter.use('/:commentsId', commentsIdRouter);

commentsRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { taskId } = req.params;
    const result = await mongoCommentsService.readByTaskId(Number(taskId));
    return res.status(200).json(result);
}));

commentsRouter.post('/', authenticateToken, checkTeamMember, TeamUserIdSelect, catchAsyncErrors(async (req, res) => {
    const user = req.team?.id;
    const { taskId } = req.params;
    const { content, parent_id } = req.body;
    if (parent_id) {
        const resultParentId = await mongoCommentsService.readId(Number(parent_id));
        if (!resultParentId) return res.status(400).json({ message: "잘못된 parent_id입니다." });
    }
    const data = { task_id: Number(taskId), workspace_team_user_id: user, content, parent_id: parent_id || null };
    if (!isMongoCommentsCreate(data)) return res.status(400).json({ message: isMongoCommentsCreate.message(data) });
    const result = await mongoCommentsService.create(data);
    return res.status(200).json(result);
}));

export default commentsRouter;