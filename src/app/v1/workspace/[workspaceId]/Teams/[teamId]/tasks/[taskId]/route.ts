import { Router } from "express";
import taskRouter from "./task/route.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { TaskState } from "@services/ENUM/task_states_enum.ts";
import { TaskPriority } from "@services/ENUM/task_priority_enum.ts";
import { isTasksCreate } from "@interfaces/guard/Tasks.guard.ts";
import tasksService from "@services/Tasks.ts";

const tasksIdRouter = Router({ mergeParams: true });

tasksIdRouter.use('/task', taskRouter);

// :id로 task를 select를 할 필요가 없음

tasksIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const taskId = Number(req.params.taskId);

    const state: TaskState = req.body.state;
    const priority: TaskPriority = req.body.priority;
    const task: string | null = req.body.task || null;
    const data = { state, priority, task };
    if (!isTasksCreate(data)) return res.status(400).json({ message: isTasksCreate.message(data) });

    const result = await tasksService.update(taskId, data);
    return res.status(200).json(result);
}));

export default tasksIdRouter;