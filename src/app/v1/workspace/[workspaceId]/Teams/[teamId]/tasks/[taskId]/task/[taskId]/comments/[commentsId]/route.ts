import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import mongoCommentsService from "@services/MongoCommentsService.ts";
import { isMongoCommentsUpdate } from "@interfaces/guard/MongoComments.guard.ts";
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