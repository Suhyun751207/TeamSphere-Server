import { Router } from "express";
import catchAsyncErrors from "../../../../../../utils/catchAsyncErrors.ts";
import { authenticateToken } from "../../../../../../middleware/auth.ts";
import { checkTeamAdminOrManager } from "../../../../../../middleware/workspaceAuth.ts";
import workspaceTeamService from "../../../../../../services/workspaceTeams.ts";
import { isWorkspaceTeamCreate } from "../../../../../../interfaces/guard/workspaceTeams.guard.ts";

const teamIdRouter = Router({ mergeParams: true });

// 팀 수정
teamIdRouter.patch('/', authenticateToken, checkTeamAdminOrManager, catchAsyncErrors(async (req, res) => {
    const name = req.body.name;
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user?.userId;
    const id = Number(req.params.teamId);
    const data = { name, workspaceId, managerId: userId };
    if (!isWorkspaceTeamCreate(data)) return res.status(400).json({ message: isWorkspaceTeamCreate.message(data) });
    const teamResult = await workspaceTeamService.update(id,data);
    return res.status(200).json(teamResult);
}))

export default teamIdRouter;