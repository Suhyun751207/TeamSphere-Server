import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { checkTeamMember } from "@middleware/workspaceAuth";
import mongoCommentsService from "@services/MongoCommentsService";
import { isMongoCommentsUpdate } from "@interfaces/guard/MongoComments.guard";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";

const commentsIdRouter = Router({ mergeParams: true });

commentsIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { commentsId } = req.params;
    const result = await mongoCommentsService.readId(Number(commentsId));
    return res.status(200).json(result);
}));

commentsIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { commentsId } = req.params;
    const { content } = req.body;
    const result = await mongoCommentsService.update(Number(commentsId), { content });
    return res.status(200).json(result);
}));

export default commentsIdRouter;