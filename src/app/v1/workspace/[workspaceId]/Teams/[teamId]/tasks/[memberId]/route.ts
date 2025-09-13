import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import tasksService from "@services/Tasks.ts";

const tasksIdRouter = Router({ mergeParams: true });

tasksIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const memberId = Number(req.params.memberId);
    const results = await tasksService.readByTaskIdAndTeamId(memberId, teamId);
    return res.status(200).json(results);
}));

export default tasksIdRouter;