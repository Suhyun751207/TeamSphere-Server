import { Router } from "express";
import catchAsyncErrors from "../../../../../../../../../utils/catchAsyncErrors.ts";
import { authenticateToken } from "../../../../../../../../../middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "../../../../../../../../../middleware/workspaceAuth.ts";
import tasksService from "../../../../../../../../../services/Tasks.ts";
import workspaceTeamUsersService from "../../../../../../../../../services/WorkspaceTeamUsers.ts";

const taskRouter = Router({ mergeParams: true });

taskRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const memberId = Number(req.params.memberId);
    const results = await workspaceTeamUsersService.readMemberIdAndTeamId(memberId, teamId);
    const workspaceId = results[0].id;

    const result = await tasksService.read(workspaceId);
    return res.status(200).json(result);
}))


export default taskRouter;