import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth.ts";
import tasksService from "@services/Tasks.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { isTasksCreate } from "@interfaces/guard/Tasks.guard.ts";

import { TaskPriority } from "@services/ENUM/task_priority_enum.ts";
import { TaskState } from "@services/ENUM/task_states_enum.ts";

import tasksMemberIdRouter from "./[memberId]/route.ts";
import tasksIdRouter from "./[taskId]/route.ts";

const tasksRouter = Router({ mergeParams: true });
tasksRouter.use('/member/:memberId', tasksMemberIdRouter);
tasksRouter.use('/:taskId', tasksIdRouter);

tasksRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const results = await tasksService.readByTeamId(teamId);
    if (!results) return res.status(400).json({ message: "team task 조회 실패" });
    return res.status(200).json(results);
}))

tasksRouter.post('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const memberId = Number(req.body.teamMemberId);
    const teamId = Number(req.params.teamId);
    const teamInfo = await workspaceTeamUsersService.readMemberIdAndTeamId(memberId, teamId);
    if (!teamInfo || teamInfo.length === 0) {
        return res.status(400).json({ message: "team task 추가 실패" });
    }
    const state: TaskState = req.body.state;
    const priority: TaskPriority = req.body.priority;
    const task = req.body.task || null;
    const data = { teamId, teamMemberId: memberId, state, priority, task };
    if (!isTasksCreate(data)) return res.status(400).json({ message: isTasksCreate.message(data) });
    const result = await tasksService.create(data);
    return res.status(200).json(result);
}));

export default tasksRouter;