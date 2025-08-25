import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth.ts";
import tasksService from "@services/Tasks.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { isTasksCreate } from "@interfaces/guard/Tasks.guard.ts";

import { TaskPriority } from "@services/ENUM/task_priority_enum.ts";
import { TaskState } from "@services/ENUM/task_states_enum.ts";
import taskRouter from "./task/route.ts";

const tasksIdRouter = Router({ mergeParams: true });
tasksIdRouter.use('/task', taskRouter);

tasksIdRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const memberId = Number(req.params.memberId);
    const results = await workspaceTeamUsersService.readMemberIdAndTeamId(memberId, teamId);
    const workspaceId = results[0].id;

    const result = await tasksService.read(workspaceId);
    return res.status(200).json(result);
}));

tasksIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { teamId, memberId, tasksId } = req.params;
    const teamInfo = await workspaceTeamUsersService.readMemberIdAndTeamId(Number(memberId), Number(teamId));
    if (!teamInfo || teamInfo.length === 0) {
        return res.status(400).json({ message: "team task 수정 실패" });
    }
    const state: TaskState = req.body.state;
    const priority: TaskPriority = req.body.priority;
    const task: string | null = req.body.task || null;
    const data = { state, priority, task };
    if (!isTasksCreate(data)) return res.status(400).json({ message: isTasksCreate.message(data) });

    const result = await tasksService.update(Number(tasksId), data);
    return res.status(200).json(result);
}));

export default tasksIdRouter;