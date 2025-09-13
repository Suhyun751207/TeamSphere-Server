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

commentsIdRouter.delete('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const user = req.user?.userId;
    const { commentsId } = req.params;

    const commentResult = await mongoCommentsService.read(Number(commentsId));
    if (!commentResult) return res.status(400).json({ message: "comment 없음" });

    const teamResult = await workspaceTeamUsersService.readMemberIdAndTeamId(Number(user), Number(commentResult?.task_id));
    if (commentResult?.member_id !== user && teamResult.length === 0) {
        return res.status(400).json({ message: "comment 삭제 실패" });
    } else if (teamResult.length > 0) {
        const role = teamResult[0].role;

        if (role !== "Admin" && role !== "Manager") {
            return res.status(400).json({ message: "comment 삭제 실패" });
        }
    }

    const result = await mongoCommentsService.delete(Number(commentsId));
    return res.status(200).json(result);
}));

export default commentsIdRouter;