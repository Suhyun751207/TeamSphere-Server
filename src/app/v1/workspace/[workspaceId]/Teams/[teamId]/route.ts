import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { authenticateToken } from "@middleware/auth";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth";
import workspaceTeamService from "@services/workspaceTeams";
import { isWorkspaceTeamCreate } from "@interfaces/guard/workspaceTeams.guard";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";
import teamIdMemberRouter from "./member/route";
import teamMessageRouter from "./message/route";
import teamDashboardRouter from "./dashboard/route";
import tasksRouter from "./tasks/route";

const teamIdRouter = Router({ mergeParams: true });
teamIdRouter.use("/member", teamIdMemberRouter);
teamIdRouter.use("/message", teamMessageRouter);
teamIdRouter.use("/dashboard", teamDashboardRouter);
teamIdRouter.use("/tasks", tasksRouter);

teamIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await workspaceTeamService.readId(teamId);
    const teamMember = await workspaceTeamUsersService.readByTeamId(teamId);
    return res.status(200).json({ team, teamMember });
}))

teamIdRouter.patch('/', authenticateToken, checkTeamAdminOrManager, catchAsyncErrors(async (req, res) => {
    const name = req.body.name;
    const workspaceId = Number(req.params.workspaceId);
    const userId = req.user?.userId;
    const id = Number(req.params.teamId);
    const data = { name, workspaceId, managerId: userId };
    if (!isWorkspaceTeamCreate(data)) return res.status(400).json({ message: isWorkspaceTeamCreate.message(data) });
    const teamResult = await workspaceTeamService.update(id, data);
    return res.status(200).json(teamResult);
}))

export default teamIdRouter;