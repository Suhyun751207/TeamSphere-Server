import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import workspaceTeamService from "@services/workspaceTeams";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";

const teamDashboardRouter = Router({ mergeParams: true });

teamDashboardRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { workspaceId, teamIdNum } = req.params;
    const teamId = Number(teamIdNum);

    const team = await workspaceTeamService.readId(teamId);
    const teamMember = await workspaceTeamUsersService.readByTeamId(teamId);

    return res.status(200).json("test");

}));

export default teamDashboardRouter;    